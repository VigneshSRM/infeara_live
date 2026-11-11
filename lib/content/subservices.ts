// The sub-services as they shipped in code: the seed for the sub_services table and the fallback
// the site uses only while that table does not exist yet. The live pages read the database, so
// editing the three lists below does not change the live site; use the admin
// (Admin → Services → Sub-services). If you change them anyway, run
// `node scripts/generate-resource-seed.mjs` so the seed follows.

import { cloudSubservices } from "./cloud-subservices";
import { cybersecuritySubservices } from "./cybersecurity-subservices";
import { productSubservices } from "./product-subservices";
import { normalizeSubservices, type SubService } from "./subservice-model";

export const codeSubservices: SubService[] = normalizeSubservices({
  cybersecurity: cybersecuritySubservices,
  cloud: cloudSubservices,
  product: productSubservices,
});
