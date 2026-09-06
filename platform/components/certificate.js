import { generateCertificate, shareCertificate } from '../../js/certificate.js';

export const CertificateComponent = {
  id: 'certificate',
  version: '1.0.0',
  dependencies: ['storage'],
  init(ctx) {
    ctx.certificate = { generate: generateCertificate, share: shareCertificate };
  },
  health() {
    try {
      const c = document.createElement('canvas');
      return { ok: Boolean(c.getContext('2d')), status: 'canvas ready' };
    } catch {
      return { ok: false, status: 'canvas unavailable' };
    }
  },
};
