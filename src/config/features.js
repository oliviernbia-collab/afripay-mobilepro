// Feature flags for capabilities that depend on external accounts/infrastructure not yet
// provisioned. Flip manually once ready — see backend/.env's TENCENT_PALM_* for the server side.
//
// Real palm-vein/palm-print biometric recognition (Tencent PalmAI Enterprise KYC) at the
// "Encaisser" scan screen — option 1 in the dual-path scan flow, replacing the QR-code scan mock
// as the default identification method. Requires a Tencent tenant/AppId/keys (sales-gated, not
// self-service; see backend/src/services/tencent/). Keep this false until then: the QR-code scan
// (option 2) stays the only active path so nothing in the app breaks — see mobileclient's own
// config/features.js, which this mirrors for the same reason.
export const TENCENT_PALM_ENABLED = false;
