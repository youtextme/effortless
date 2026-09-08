/**
 * Kid-think takeaway packs — five standalone scenarios per day's idea.
 * Prompts are dinner / homework / playground / sibling / this-week moments.
 */

export const TAKEAWAY_COUNT = 5;

const RUSH = 'Finish as fast as you can and never think about it again';
const MEMORISE = 'Memorise a spelling list and stop asking questions';
const IGNORE = 'Ignore real life and only collect fancy words';
const ADULT = 'Wait for an adult to do all the thinking for you';
const MARKS = 'Only care about marks, never about understanding';
const COPY = 'Copy a friend and pretend you already know';
const SKIP = 'Skip anything new and only repeat what feels easy';

function pack(items) {
  return { items };
}

const BANK = {
  'Great learners ask questions and explore the world with wonder.': pack([
    {
      prompt: 'At dinner a friend says reading is just for finishing pages. What would you tell them this one was really about?',
      correct: 'Getting curious, asking real questions, and poking around until something makes sense',
      wrongs: [RUSH, MEMORISE, IGNORE],
      thinkAloud: 'Hey — picture dinner. Someone asks why the soup tastes different. A curious kid doesn\'t shrug. They taste again, ask "what changed?", and look. Which choice sounds like that kind of kid, not a speed race?',
      retryAloud: 'Think curious, questions, look closer — like checking a droopy plant. You\'ve got this. Try again.',
    },
    {
      prompt: 'You are stuck on homework and your brain feels blank. Which move matches today\'s idea?',
      correct: 'Ask a question and look closer, like checking why a plant looks droopy',
      wrongs: ['Guess wildly and slam the book shut', COPY, SKIP],
      thinkAloud: 'Hey — remember last time a Lego piece wouldn\'t fit? You didn\'t throw the box. You turned it, asked why, and tried again. Homework can be the same. Which choice is that?',
      retryAloud: 'Keywords: ask, look closer, plant. Not guessing or copying. Try again.',
    },
    {
      prompt: 'On the playground a bug is doing something weird. What would a great learner do?',
      correct: 'Watch it, wonder why, and try to find out',
      wrongs: ['Squash it and run away', 'Pretend you already know everything about bugs', MARKS],
      thinkAloud: 'Hey — imagine a beetle dragging a crumb bigger than its head. You and a friend could watch and guess, then check. That\'s exploring, not a test. Which choice is the watching-and-wondering one?',
      retryAloud: 'Watch, wonder why, find out. Like a playground mystery. Try again.',
    },
    {
      prompt: 'Your sibling says "stop asking so many questions." What is the real lesson from this reading?',
      correct: 'Questions are how you explore and learn, not a nuisance',
      wrongs: ['Questions waste time so stay quiet', 'Only teachers are allowed to ask things', ADULT],
      thinkAloud: 'Hey — when you ask Mum "why is the sky pink tonight?" you are exploring, not being annoying. This reading loves that. Which choice treats questions as useful?',
      retryAloud: 'Questions help you explore. Not "stay quiet". You can do this. Try again.',
    },
    {
      prompt: 'Which plan for this week actually uses the idea from this reading?',
      correct: 'Pick one thing you don\'t get yet and ask a real question about it',
      wrongs: [RUSH, SKIP, IGNORE],
      thinkAloud: 'Hey — think of one thing this week: a game rule, a word, or why toast burns. Ask a real question about that. Which plan sounds like using the idea, not racing pages?',
      retryAloud: 'Pick one confusing thing. Ask a real question. Try that one.',
    },
  ]),

  'Clear words help you share ideas and connect with others.': pack([
    {
      prompt: 'Your friend looks confused after you explain a game. What would this reading tell you to do?',
      correct: 'Say it in simpler words so they can actually join in',
      wrongs: ['Use bigger words to sound smart', RUSH, IGNORE],
      thinkAloud: 'Hey — remember explaining tag to a younger kid? If you say "the perimeter is out of bounds" they freeze. If you say "don\'t cross that line" they play. Which choice is the connecting one?',
      retryAloud: 'Simple words help a friend join the game. Try again.',
    },
    {
      prompt: 'You need to tell Mum why you are upset. Which choice matches today\'s idea?',
      correct: 'Name the feeling and the thing that happened, in words she can follow',
      wrongs: ['Slam the door and hope she guesses', 'Use a speech full of fancy words nobody uses at home', MARKS],
      thinkAloud: 'Hey — "I\'m mad because my turn got skipped" is clearer than roaring. Dinner-table words beat mystery anger. Which choice would actually help Mum understand you?',
      retryAloud: 'Name the feeling and what happened. Clear, not fancy. Try again.',
    },
    {
      prompt: 'In a group chat your message made everyone go quiet. What should you try?',
      correct: 'Rewrite it so the idea is easy to follow, like explaining homework at the table',
      wrongs: ['Add more slang until nobody knows the point', COPY, SKIP],
      thinkAloud: 'Hey — like when you type "idk maybe later stuff" and your friend has no idea if you\'re coming. Clear words fix that. Which choice is rewriting so people get you?',
      retryAloud: 'Rewrite so people can follow. Like homework at the table. Try again.',
    },
    {
      prompt: 'Your sibling asks what you learned. Which answer uses today\'s idea?',
      correct: 'Share the idea in everyday words so they feel included',
      wrongs: ['Say a long word and walk away', MEMORISE, ADULT],
      thinkAloud: 'Hey — if you tell a little sibling "we practised saying what we mean so people get us", they can nod. Bragging with a giant word leaves them out. Which choice includes them?',
      retryAloud: 'Everyday words include your sibling. Not showing off. Try again.',
    },
    {
      prompt: 'Which moment this week is really using this reading?',
      correct: 'Explaining your idea in words a friend could repeat back',
      wrongs: [RUSH, IGNORE, 'Talking so fast nobody can jump in'],
      thinkAloud: 'Hey — if a friend can repeat your idea in their own words, you connected. That\'s the whole point — like sharing a secret handshake, but with sentences. Which moment is that?',
      retryAloud: 'A friend can repeat your idea. That\'s connecting. Try again.',
    },
  ]),

  'Smart thinkers examine evidence before forming opinions.': pack([
    {
      prompt: 'A rumour at school says a friend cheated. What would this reading tell you to do first?',
      correct: 'Check what you actually saw or heard before you decide they did it',
      wrongs: ['Repeat the rumour so you sound in the know', 'Decide they\'re guilty because it\'s juicy', ADULT],
      thinkAloud: 'Hey — imagine someone says your friend stole a pencil. Before you pile on, you\'d ask "did anyone see it?" That\'s evidence, like looking in your own bag first. Which choice waits before judging?',
      retryAloud: 'Check what you saw or heard. Don\'t pile on. Try again.',
    },
    {
      prompt: 'Two friends argue about who won a playground match. Which move matches the idea?',
      correct: 'Look at the score, the rules you agreed, then decide',
      wrongs: ['Pick the louder friend', 'Pick whoever you like more', RUSH],
      thinkAloud: 'Hey — like checking the scoreboard instead of shouting. You already do this in games. Which choice looks at proof before picking a side?',
      retryAloud: 'Score and rules first, then decide. You\'ve got this. Try again.',
    },
    {
      prompt: 'An ad on your tablet says a snack "makes you unbeatable." What should you do?',
      correct: 'Ask what proof they have, instead of believing the shouty sentence',
      wrongs: ['Believe it because the colours are cool', IGNORE, COPY],
      thinkAloud: 'Hey — ads talk like a kid on the playground bragging. A smart thinker says "says who?" same as when a friend claims they never miss a shot. Which choice asks for proof?',
      retryAloud: 'Ask for proof, not cool colours. Try again.',
    },
    {
      prompt: 'Homework asks which sentence is true. What is the smart-thinker move?',
      correct: 'Read the facts in front of you, then choose — don\'t guess from a feeling',
      wrongs: ['Pick the longest sentence so it looks clever', SKIP, MARKS],
      thinkAloud: 'Hey — it\'s like choosing a snack by reading the label, not by the cartoon on the box. Look at what\'s actually written. Which choice does that?',
      retryAloud: 'Read the facts in front of you. Not guessing. Try again.',
    },
    {
      prompt: 'Which plan this week uses today\'s idea?',
      correct: 'When you hear a big claim, ask "how do we know?" before you agree',
      wrongs: [MEMORISE, RUSH, 'Agree fast so the conversation ends'],
      thinkAloud: 'Hey — "how do we know?" is a superpower at dinner, in class, and in group chats. It\'s not rude — it\'s thinking. Which plan sounds like that?',
      retryAloud: 'Ask how we know before you agree. Try that one.',
    },
  ]),

  'The natural world is full of patterns waiting to be understood.': pack([
    {
      prompt: 'You notice the same birds show up at the same time each evening. What is this reading asking you to do?',
      correct: 'Notice the pattern and get curious about why it keeps happening',
      wrongs: ['Ignore it because it isn\'t a test question', RUSH, MEMORISE],
      thinkAloud: 'Hey — it\'s like realising you always get hungry right after football. That repeat is a pattern. Nature does the same thing with birds, rain, and shadows. Which choice notices it?',
      retryAloud: 'Notice the repeat and get curious why. Try again.',
    },
    {
      prompt: 'Your toast burns every time you use the top setting. Which move matches the idea?',
      correct: 'Spot the pattern (top setting → burnt) and try a smaller change',
      wrongs: ['Keep the same setting and hope', 'Throw out the toaster in a huff', ADULT],
      thinkAloud: 'Hey — kitchen science! If it burns every time, that\'s a pattern, like puddles after rain. Change one thing and watch. Which choice treats it like a pattern?',
      retryAloud: 'Top setting burns. Change one thing. Pattern thinking. Try again.',
    },
    {
      prompt: 'On a walk you see shells in a line on the sand. What would a pattern-spotter do?',
      correct: 'Look closer and wonder what made that line',
      wrongs: ['Kick them all without looking', SKIP, IGNORE],
      thinkAloud: 'Hey — like noticing your footprints make a path behind you. Something made that shell line too. Which choice looks and wonders, instead of just kicking?',
      retryAloud: 'Look closer. Wonder what made the line. Try again.',
    },
    {
      prompt: 'A friend says nature is random so there is nothing to learn. What do you say?',
      correct: 'Lots of things repeat — weather, plants, animals — and we can learn those repeats',
      wrongs: ['Agree, because thinking is only for class', MARKS, COPY],
      thinkAloud: 'Hey — seasons come back. Your shadow gets long in the evening. That\'s not random. Which answer defends the idea that patterns are learnable?',
      retryAloud: 'Things repeat: weather, plants, animals. We can learn them. Try again.',
    },
    {
      prompt: 'Which this-week plan uses the idea?',
      correct: 'Pick one everyday repeat (bedtime light, rain, leftovers) and notice what stays the same',
      wrongs: [RUSH, IGNORE, 'Only study patterns that are on a worksheet'],
      thinkAloud: 'Hey — leftovers in the fridge, the way your street gets noisy after school — those are patterns too. You don\'t need a lab. Which plan notices a repeat in your week?',
      retryAloud: 'Notice one everyday repeat. Not just worksheets. Try again.',
    },
  ]),

  'Understanding the past helps us build a better future.': pack([
    {
      prompt: 'You and a sibling keep fighting over the same chair. What would this reading suggest?',
      correct: 'Remember what went wrong last time and try a fairer plan next time',
      wrongs: ['Pretend last time never happened', RUSH, COPY],
      thinkAloud: 'Hey — last time you both grabbed and someone cried. That\'s your "past." A better future is a timer, or taking turns. Which choice uses yesterday to fix tomorrow?',
      retryAloud: 'Use what went wrong last time to make a fairer plan. Try again.',
    },
    {
      prompt: 'You missed a goal in last week\'s match. Which move matches the idea?',
      correct: 'Look at what happened, then practise that bit so the next match goes better',
      wrongs: ['Never play again', 'Blame the ball and learn nothing', SKIP],
      thinkAloud: 'Hey — coaches do this: watch the replay in your head, then practise. History isn\'t just kings — it\'s last Saturday too. Which choice builds a better next match?',
      retryAloud: 'Look at what happened, then practise that bit. Try again.',
    },
    {
      prompt: 'A story from long ago shows people making a kind choice. Why bother learning it?',
      correct: 'Old stories can give you ideas for how to treat people now',
      wrongs: ['The past is only for memorising dates', IGNORE, MARKS],
      thinkAloud: 'Hey — when a grown-up tells you how they shared at school, you can copy the kind part today. History is a box of tried ideas. Which choice uses the story now?',
      retryAloud: 'Old stories can teach how to treat people now. Try again.',
    },
    {
      prompt: 'You spilled juice on homework yesterday. What is the "build a better future" move tonight?',
      correct: 'Put a cup away from the paper this time, because you remember the mess',
      wrongs: ['Sit the same way and hope', ADULT, RUSH],
      thinkAloud: 'Hey — that\'s tiny history: juice + paper = disaster. Tonight you move the cup. Same idea as big history, just at your table. Which choice uses the memory?',
      retryAloud: 'Move the cup because you remember the mess. Try again.',
    },
    {
      prompt: 'Which plan this week uses today\'s idea?',
      correct: 'When something repeats badly, change one thing because you remember last time',
      wrongs: [MEMORISE, SKIP, 'Say "whatever" and never look back'],
      thinkAloud: 'Hey — forgotten water bottles, late homework, fights over a controller — if it keeps happening, the past is tapping you. Change one thing. Which plan is that?',
      retryAloud: 'If it repeats badly, change one thing. Try that one.',
    },
  ]),

  'Creativity turns imagination into something others can experience.': pack([
    {
      prompt: 'You invented a funny game in your head. What would this reading tell you to do?',
      correct: 'Make it real enough that a friend can play it too — rules, drawing, or acting it out',
      wrongs: ['Keep it secret forever so nobody else enjoys it', MEMORISE, RUSH],
      thinkAloud: 'Hey — a joke only you know isn\'t a joke yet. When you tell it at lunch, other kids laugh. Creativity is imagination that other people can join. Which choice lets a friend in?',
      retryAloud: 'Make it real so a friend can play too. Try again.',
    },
    {
      prompt: 'You imagine a comic about your dog. Which move matches the idea?',
      correct: 'Draw or tell the comic so someone else can see the story',
      wrongs: ['Only think about it on the bus and never share', SKIP, ADULT],
      thinkAloud: 'Hey — stick figures count! If your sibling can point at a panel and giggle, you turned imagination into a thing. Which choice makes it shareable?',
      retryAloud: 'Draw or tell it so someone else can see it. Try again.',
    },
    {
      prompt: 'A friend says "I\'m not creative because I can\'t paint." What do you say?',
      correct: 'Creativity is making an idea others can hear, play, or see — Lego, jokes, recipes, dances',
      wrongs: ['Agree — only painters count', MARKS, IGNORE],
      thinkAloud: 'Hey — building a pillow fort is creative. So is a new handshake. Paint is one tool, not the whole idea. Which answer lets your friend in?',
      retryAloud: 'Lego, jokes, recipes, dances count too. Try again.',
    },
    {
      prompt: 'You made up new lyrics in the shower. Which choice uses today\'s idea?',
      correct: 'Sing or write them so a friend can try them with you',
      wrongs: [RUSH, COPY, 'Forget them on purpose'],
      thinkAloud: 'Hey — shower songs are famous in families for a reason. If you hum it at dinner, somebody else can join the chorus. Which choice lets them experience it?',
      retryAloud: 'Sing or write them so a friend can join. Try again.',
    },
    {
      prompt: 'Which this-week plan uses the idea?',
      correct: 'Turn one idea in your head into a thing a person in your house could try',
      wrongs: [MEMORISE, SKIP, 'Only imagine, never make'],
      thinkAloud: 'Hey — a card, a Lego scene, a dance in the kitchen. Tiny is fine. Which plan makes something someone else could try?',
      retryAloud: 'Make one idea into a thing someone at home could try. Try that.',
    },
  ]),

  'True leaders inspire others through action and integrity.': pack([
    {
      prompt: 'Kids are leaving rubbish after lunch. What would a real leader do?',
      correct: 'Pick some up and invite others — don\'t just boss people while sitting still',
      wrongs: ['Shout orders and do nothing yourself', 'Hide and hope a teacher yells', RUSH],
      thinkAloud: 'Hey — if you start putting wrappers in the bin, friends often copy. That\'s leading by doing, like being first to say sorry after a fight. Which choice is action plus honesty?',
      retryAloud: 'Do the kind thing, then invite others. Not just shouting. Try again.',
    },
    {
      prompt: 'You want to be captain of a playground game. Which choice matches today\'s idea?',
      correct: 'Play fair, keep the rules you asked for, and help someone who is left out',
      wrongs: ['Change the rules only when you are losing', COPY, MARKS],
      thinkAloud: 'Hey — the kid everyone trusts is the one who doesn\'t cheat when it\'s convenient. Integrity is doing the fair thing when you could sneak. Which choice is that captain?',
      retryAloud: 'Play fair, keep your own rules, include someone. Try again.',
    },
    {
      prompt: 'A friend is being teased. What is the leader move?',
      correct: 'Stand with them and say it isn\'t okay — then follow through, not just talk',
      wrongs: ['Laugh along so you stay popular', SKIP, ADULT],
      thinkAloud: 'Hey — saying "that\'s mean" and then walking with your friend is leadership. Whispering later "I didn\'t like that" doesn\'t help them in the moment. Which choice is action?',
      retryAloud: 'Stand with them and follow through. Not laughing along. Try again.',
    },
    {
      prompt: 'You promised to help with dishes. Which choice shows integrity?',
      correct: 'Do it even if a better show started, because you said you would',
      wrongs: ['Sneak off because nobody is watching', IGNORE, RUSH],
      thinkAloud: 'Hey — integrity is keeping a tiny promise when the TV gets interesting. Same idea as a captain who doesn\'t cheat. Which choice keeps the promise?',
      retryAloud: 'You said you would — do the dishes anyway. Try again.',
    },
    {
      prompt: 'Which plan this week uses the idea?',
      correct: 'Do one helpful thing first, then ask others to join — and keep your word',
      wrongs: [MEMORISE, 'Give speeches and skip the work', SKIP],
      thinkAloud: 'Hey — start the board game setup, start the tidy, start the apology. People copy starters. Which plan is doing first, then inviting?',
      retryAloud: 'Helpful thing first, then invite, and keep your word. Try that.',
    },
  ]),

  'Resources are limited — wise choices create prosperity.': pack([
    {
      prompt: 'You have one chocolate bar and two friends. What matches today\'s idea?',
      correct: 'Plan a fair share (or save some) instead of eating it all in a rush',
      wrongs: ['Hide it and eat it all later with no plan', RUSH, IGNORE],
      thinkAloud: 'Hey — pocket money, snacks, battery on a tablet — they run out. Wise is "how do we make this last or fair?" like splitting stickers. Which choice plans the limited thing?',
      retryAloud: 'Plan a fair share or save some. Things run out. Try again.',
    },
    {
      prompt: 'Your tablet is at 12% and you have homework plus a game. Wise choice?',
      correct: 'Do the important thing first so the battery isn\'t wasted',
      wrongs: ['Game until it dies, then shrug', ADULT, COPY],
      thinkAloud: 'Hey — 12% is a tiny "resource." Using it on the thing that matters is the same idea as not spending all your coins on the first shop. Which choice is wise?',
      retryAloud: 'Important thing first so the battery isn\'t wasted. Try again.',
    },
    {
      prompt: 'You keep losing pencils. What would this reading suggest?',
      correct: 'Treat them as limited — put them in one place so you aren\'t always "out"',
      wrongs: ['Grab a new one every time and never look after them', SKIP, MARKS],
      thinkAloud: 'Hey — it\'s like always losing your water bottle. One hook by the door fixes a lot. Limited things need a home. Which choice looks after them?',
      retryAloud: 'One place for pencils so you\'re not always out. Try again.',
    },
    {
      prompt: 'A friend wants you both to spend all your coins on sweets now. What do you say?',
      correct: 'We can enjoy some, and keep a bit for later — that\'s a wise choice',
      wrongs: ['Spend every coin so the day feels huge', MEMORISE, RUSH],
      thinkAloud: 'Hey — "some now, some later" is how you still have bus money or a weekend treat. Prosperity here just means you\'re not stuck with nothing tomorrow. Which answer is that?',
      retryAloud: 'Some now, some later. Not every coin. Try again.',
    },
    {
      prompt: 'Which this-week plan uses the idea?',
      correct: 'When something is limited (time, snacks, battery), choose what matters most first',
      wrongs: [IGNORE, SKIP, 'Use it all instantly so nobody else can'],
      thinkAloud: 'Hey — Saturday morning is limited too. If you burn it all on one app, the football doesn\'t happen. Which plan chooses what matters first?',
      retryAloud: 'Limited time, snacks, battery: what matters first. Try that.',
    },
  ]),

  'Innovation solves problems that seemed impossible yesterday.': pack([
    {
      prompt: 'The remote is lost again. What would this reading cheer for?',
      correct: 'Try a new idea (a basket by the sofa, a bright sticker) that might fix the repeat problem',
      wrongs: ['Say it\'s impossible and give up forever', COPY, RUSH],
      thinkAloud: 'Hey — somebody invented remote finders because losing remotes felt impossible. You can invent a basket. Innovation is a new try at a stuck problem. Which choice is a new idea?',
      retryAloud: 'New idea for a repeat problem — basket or sticker. Try again.',
    },
    {
      prompt: 'Your school bag strap keeps slipping. Which move matches the idea?',
      correct: 'Test a fix (knot, safety pin, different shoulder) until it works better',
      wrongs: ['Complain and never try a fix', ADULT, MEMORISE],
      thinkAloud: 'Hey — that\'s garage-style thinking. Tape, a knot, a pin — yesterday it felt doomed, today you test. Which choice experiments?',
      retryAloud: 'Test a fix until it works better. Not just complaining. Try again.',
    },
    {
      prompt: 'A friend says "we can\'t make the card game fair." What do you try?',
      correct: 'Invent a new rule or tool (timer, extra card) and see if it helps',
      wrongs: [SKIP, MARKS, 'Agree it\'s impossible and stop playing'],
      thinkAloud: 'Hey — house rules are kid innovation. Someone invented "no peeking" once. You can invent the next fix. Which choice tries a new rule?',
      retryAloud: 'Invent a new rule or tool and test it. Try again.',
    },
    {
      prompt: 'You can\'t reach the cereal on the shelf. Innovation looks like…',
      correct: 'A safe new method (stool you\'re allowed to use, asking with a plan) not just jumping',
      wrongs: ['Jump until someone yells', IGNORE, RUSH],
      thinkAloud: 'Hey — step-stools exist because "too short" felt impossible. Asking for the stool is part of the invention. Which choice is a safe new method?',
      retryAloud: 'Safe new method, not wild jumping. Try again.',
    },
    {
      prompt: 'Which plan this week uses the idea?',
      correct: 'Pick one annoying repeat problem and test one new fix',
      wrongs: [MEMORISE, SKIP, 'Call every problem impossible'],
      thinkAloud: 'Hey — squeaky door, lost socks, messy cables. One new fix is enough. Which plan treats a stuck thing as solvable?',
      retryAloud: 'One annoying repeat. Test one new fix. Try that.',
    },
  ]),

  'Taking care of your body and mind is the foundation of success.': pack([
    {
      prompt: 'You have a test tomorrow and you\'re exhausted. What matches today\'s idea?',
      correct: 'Sleep and a real meal so your brain can work — cramming on fumes isn\'t strong',
      wrongs: ['Stay up all night because "success" means no sleep', RUSH, IGNORE],
      thinkAloud: 'Hey — it\'s like charging a tablet before a trip. Your body is the charger. A foggy brain can\'t show what you know. Which choice looks after body and mind?',
      retryAloud: 'Sleep and a real meal. Not all-night fumes. Try again.',
    },
    {
      prompt: 'You feel fizzy-angry after a long screen session. Wise move?',
      correct: 'Pause: water, stretch, or a walk, then come back — minds need care too',
      wrongs: ['Push harder until you snap at someone', SKIP, COPY],
      thinkAloud: 'Hey — when a game tilts you, a water break is not quitting. It\'s how you stay a decent human at dinner. Which choice cares for the mind?',
      retryAloud: 'Pause, water, stretch or walk. Then come back. Try again.',
    },
    {
      prompt: 'Football is on and you skipped lunch. What would this reading say?',
      correct: 'Eat something so you can actually play well — your body is the foundation',
      wrongs: ['Ignore hunger because trying harder is enough', MARKS, ADULT],
      thinkAloud: 'Hey — empty tummy, clumsy feet. Even pros eat. Taking care isn\'t lazy; it\'s how skill shows up. Which choice feeds the foundation?',
      retryAloud: 'Eat so you can play well. Body first. Try again.',
    },
    {
      prompt: 'A friend brags they never rest. What do you say?',
      correct: 'Rest is part of doing well — brains and bodies need it, like sleep after a match',
      wrongs: ['Agree that rest is for quitters', MEMORISE, RUSH],
      thinkAloud: 'Hey — even your phone gets hot and needs a break. You\'re not a robot. Which answer treats rest as part of success?',
      retryAloud: 'Rest is part of doing well, like sleep after a match. Try again.',
    },
    {
      prompt: 'Which this-week plan uses the idea?',
      correct: 'Protect one daily care thing (sleep, food, a quiet pause) so everything else can work',
      wrongs: [SKIP, IGNORE, 'Drop every care habit to look busy'],
      thinkAloud: 'Hey — one protected thing: a real bedtime, a lunch you actually eat, five quiet minutes. That\'s the foundation under homework and games. Which plan protects care?',
      retryAloud: 'Protect sleep, food, or a quiet pause. Foundation first. Try that.',
    },
  ]),
};

export function takeawayPack(takeaway) {
  const found = BANK[String(takeaway || '').trim()];
  if (found?.items?.length >= TAKEAWAY_COUNT) {
    return found.items.slice(0, TAKEAWAY_COUNT);
  }
  return fallbackItems(takeaway);
}

function fallbackItems(takeaway) {
  const idea = String(takeaway || 'Use the idea in real life this week').trim();
  const shortIdea = idea.length > 90 ? `${idea.slice(0, 87)}…` : idea;
  return [
    {
      prompt: 'At dinner a friend asks what this reading was really for. Which answer would actually help them?',
      correct: `Try the idea in real life: ${shortIdea}`,
      wrongs: [RUSH, MEMORISE, IGNORE],
      thinkAloud: 'Hey — tell them a version you could use at homework or on the playground, not a speed prize. Which choice sounds useful this week?',
      retryAloud: 'Pick the useful real-life idea, not rushing. Try again.',
    },
    {
      prompt: 'You are stuck. What would this reading tell you to do?',
      correct: 'Use the lesson in a small everyday moment instead of giving up',
      wrongs: [COPY, SKIP, ADULT],
      thinkAloud: 'Hey — tiny moments count: a question at homework, a kinder message, a fairer turn. Which choice uses the lesson?',
      retryAloud: 'Use the lesson in a small everyday moment. Try again.',
    },
    {
      prompt: 'Your sibling mixed up the lesson. Which one is the real idea?',
      correct: shortIdea,
      wrongs: [MARKS, RUSH, IGNORE],
      thinkAloud: 'Hey — the real idea is something you could try at home this week, not marks or speed. Which one could you actually use?',
      retryAloud: 'The real idea is one you can use at home. Try again.',
    },
    {
      prompt: 'Which playground or home moment is using this reading?',
      correct: 'Pausing, thinking, and trying the idea with people you actually see this week',
      wrongs: ['Only during a timed test', 'Never — reading is just for marks', 'Only if someone recites the page for you'],
      thinkAloud: 'Hey — dinner, a game, a message to a friend. Which moment is you using the idea, not a test robot?',
      retryAloud: 'Use it with people you see this week. Try again.',
    },
    {
      prompt: 'Which plan for this week reinforces the key takeaway?',
      correct: 'Practise the idea once in real life and tell someone what you noticed',
      wrongs: [MEMORISE, SKIP, RUSH],
      thinkAloud: 'Hey — one try, then tell Mum or a friend. That makes it stick, like teaching a handshake. Which plan is that?',
      retryAloud: 'Practise once in real life and tell someone. Try that.',
    },
  ];
}
