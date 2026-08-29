import { chromium } from 'playwright-core';
import { EXIT } from './exit-codes.js';
import { normalizePhone } from './validation.js';
import { countOccurrences, isSendVerified } from './verification.js';
import {
  connectCdp,
  findWhatsAppPage,
  waitForLoginState,
  getMainText,
  getComposerText,
  saveScreenshot,
  saveDebugMeta,
  isCdpUp,
} from './cdp.js';

/**
 * Open chat by contact name.
 * @param {import('playwright-core').Page} page
 * @param {string} name
 */
export async function openChatByName(page, name) {
  const titleSpan = page.locator(`#pane-side span[title="${name}"]`);
  if ((await titleSpan.count()) > 0) {
    await titleSpan.first().click();
    await page.waitForTimeout(800);
    return true;
  }

  const searchBox = page.locator(
    '#side div[contenteditable="true"][data-tab="3"], #side div[contenteditable="true"]'
  ).first();

  if ((await searchBox.count()) > 0) {
    await searchBox.click();
    await searchBox.fill('');
    await page.keyboard.type(name, { delay: 30 });
    await page.waitForTimeout(1200);

    const result = page.locator(`#pane-side span[title="${name}"]`);
    if ((await result.count()) > 0) {
      await result.first().click();
      await page.waitForTimeout(800);
      return true;
    }
  }

  const anyEditable = page.locator('#side div[contenteditable="true"]').first();
  if ((await anyEditable.count()) > 0) {
    await anyEditable.click();
    await anyEditable.fill('');
    await page.keyboard.type(name, { delay: 30 });
    await page.waitForTimeout(1200);

    const result = page.locator(`#pane-side span[title="${name}"]`);
    if ((await result.count()) > 0) {
      await result.first().click();
      await page.waitForTimeout(800);
      return true;
    }
  }

  return false;
}

/**
 * Open chat by phone number via deep link.
 * @param {import('playwright-core').Page} page
 * @param {string} phone
 */
export async function openChatByPhone(page, phone) {
  const digits = normalizePhone(phone);
  await page.goto(`https://web.whatsapp.com/send?phone=${digits}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(2000);

  const invalidPhone = page.locator('text=Phone number shared via url is invalid');
  if ((await invalidPhone.count()) > 0) return false;

  const main = page.locator('#main');
  return (await main.count()) > 0;
}

/**
 * Type message into composer and send.
 * @param {import('playwright-core').Page} page
 * @param {string} message
 */
export async function typeAndSend(page, message) {
  const composer = page.locator('#main footer div[contenteditable="true"]');
  if ((await composer.count()) === 0) {
    return { sent: false, reason: 'no-composer' };
  }

  const readOnly = page.locator('text=Only admins can send messages');
  if ((await readOnly.count()) > 0) {
    return { sent: false, reason: 'read-only' };
  }

  await composer.click();
  await composer.fill('');
  await page.keyboard.type(message, { delay: 15 });

  const sendBtn = page.locator(
    'button[aria-label="Send"], span[data-icon="send"]'
  ).first();

  if ((await sendBtn.count()) > 0) {
    await sendBtn.click();
  } else {
    await page.keyboard.press('Enter');
  }

  await page.waitForTimeout(1500);
  return { sent: true };
}

/**
 * Send a WhatsApp message and verify via occurrence delta.
 * @param {{ name?: string, phone?: string, message: string }} opts
 * @returns {Promise<{ code: number, receipt: object }>}
 */
export async function sendMessage(opts) {
  const { name, phone, message } = opts;
  let browser;

  try {
    browser = await connectCdp(chromium);
    const page = await findWhatsAppPage(browser);

    if (!page) {
      return {
        code: EXIT.NO_PAGE,
        receipt: { ok: false, error: 'No web.whatsapp.com page found in CDP.' },
      };
    }

    const login = await waitForLoginState(page);
    if (!login.loggedIn) {
      await saveScreenshot(page, 'needs-login');
      return {
        code: EXIT.NEEDS_LOGIN,
        receipt: { ok: false, error: 'WhatsApp is not logged in (QR code visible).' },
      };
    }

    let opened = false;
    if (phone) {
      opened = await openChatByPhone(page, phone);
    } else if (name) {
      opened = await openChatByName(page, name);
    }

    if (!opened) {
      await saveScreenshot(page, 'chat-not-found');
      return {
        code: EXIT.CHAT_NOT_FOUND,
        receipt: {
          ok: false,
          error: phone
            ? `Chat not found for phone ${normalizePhone(phone)}.`
            : `Chat not found for name "${name}".`,
        },
      };
    }

    const beforeText = await getMainText(page);
    const beforeCount = countOccurrences(beforeText, message);

    const sendResult = await typeAndSend(page, message);
    if (!sendResult.sent) {
      if (sendResult.reason === 'read-only') {
        await saveScreenshot(page, 'read-only');
        return {
          code: EXIT.READ_ONLY,
          receipt: { ok: false, error: 'Chat is read-only (only admins can send).' },
        };
      }
      await saveScreenshot(page, 'send-failed');
      return {
        code: EXIT.INTERNAL,
        receipt: { ok: false, error: 'Could not find message composer.' },
      };
    }

    await page.waitForTimeout(1000);
    const afterText = await getMainText(page);
    const afterCount = countOccurrences(afterText, message);
    const composerText = await getComposerText(page);

    const verified = isSendVerified({ beforeCount, afterCount, composerText });

    const meta = {
      beforeCount,
      afterCount,
      delta: afterCount - beforeCount,
      composerCleared: !composerText || composerText.trim() === '',
      verified,
    };
    await saveDebugMeta('send-verify', meta);

    if (!verified) {
      await saveScreenshot(page, 'unverified');
      return {
        code: EXIT.UNVERIFIED,
        receipt: {
          ok: false,
          error: 'Send could not be verified (occurrence delta or composer clear failed).',
          ...meta,
        },
      };
    }

    await saveScreenshot(page, 'verified');
    return {
      code: EXIT.OK,
      receipt: {
        ok: true,
        message: 'Message sent and verified.',
        recipient: phone ? { phone: normalizePhone(phone) } : { name },
        ...meta,
      },
    };
  } catch (err) {
    const code = err.exitCode ?? EXIT.INTERNAL;
    return {
      code,
      receipt: { ok: false, error: err.message },
    };
  } finally {
    if (browser) {
      try {
        browser.close();
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * Get WhatsApp session status via CDP.
 */
export async function getStatus() {
  if (!(await isCdpUp())) {
    return { code: EXIT.CDP_DOWN, status: { cdp: false, loggedIn: false } };
  }

  let browser;
  try {
    browser = await connectCdp(chromium);
    const page = await findWhatsAppPage(browser);
    if (!page) {
      return { code: EXIT.NO_PAGE, status: { cdp: true, page: false, loggedIn: false } };
    }

    const login = await waitForLoginState(page);
    return {
      code: EXIT.OK,
      status: {
        cdp: true,
        page: true,
        loggedIn: login.loggedIn,
        url: page.url(),
      },
    };
  } catch (err) {
    return {
      code: err.exitCode ?? EXIT.INTERNAL,
      status: { cdp: false, error: err.message },
    };
  } finally {
    if (browser) {
      try {
        browser.close();
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * List visible chat titles from the sidebar.
 */
export async function listChats() {
  if (!(await isCdpUp())) {
    return { code: EXIT.CDP_DOWN, chats: [] };
  }

  let browser;
  try {
    browser = await connectCdp(chromium);
    const page = await findWhatsAppPage(browser);
    if (!page) {
      return { code: EXIT.NO_PAGE, chats: [] };
    }

    const login = await waitForLoginState(page);
    if (!login.loggedIn) {
      return { code: EXIT.NEEDS_LOGIN, chats: [] };
    }

    const spans = page.locator('#pane-side span[title]');
    const count = await spans.count();
    const chats = [];
    const seen = new Set();

    for (let i = 0; i < count; i++) {
      const title = await spans.nth(i).getAttribute('title');
      if (title && !seen.has(title)) {
        seen.add(title);
        chats.push(title);
      }
    }

    return { code: EXIT.OK, chats };
  } catch (err) {
    return { code: err.exitCode ?? EXIT.INTERNAL, chats: [], error: err.message };
  } finally {
    if (browser) {
      try {
        browser.close();
      } catch {
        /* ignore */
      }
    }
  }
}
