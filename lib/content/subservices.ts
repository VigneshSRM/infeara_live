// The sub-services as they shipped in code: the seed for the sub_services table and the fallback
// the site uses only while that table does not exist yet. The live pages read the database, so
// editing the three lists below does not change the live site; use the admin
// (Admin → Services → Sub-services). If you change them anyway, run
// `node scripts/generate-resource-seed.mjs` so the seed follows.
//
// The three lists stay exactly as they were seeded. The wording that changed afterwards (the
// search titles, and the fuller text of three pages) lives in copy-refresh.ts and is applied here,
// so the fallback matches the database once its migration has run.

import { cloudSubservices } from "./cloud-subservices";
import { refreshSubservices } from "./copy-refresh";
import { cybersecuritySubservices } from "./cybersecurity-subservices";
import { productSubservices } from "./product-subservices";
import { normalizeSubservices, type SubService } from "./subservice-model";

export const codeSubservices: SubService[] = refreshSubservices(
  normalizeSubservices({
    cybersecurity: cybersecuritySubservices,
    cloud: cloudSubservices,
    product: productSubservices,
  }),
);
