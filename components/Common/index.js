import {Overview} from "./Overview";
import {Files} from "./Files";
import {Discussions} from "./Discussions";
import {InvoiceDetails} from "./InvoiceDetails";
export {Overview, Files, Discussions,InvoiceDetails};


// ALTER TABLE `tbl_leads` CHANGE `permission` `permission` ENUM('all','select_designations','select_individual_people') CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT 'all';
// ALTER TABLE `tbl_leads` ADD `permission_value` TEXT NULL DEFAULT NULL AFTER `permission`;
