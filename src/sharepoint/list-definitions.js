// Schema for the SCOUT-Scores list. vendor_id is technically unique (enforceUniqueValues:true)
// AND indexed:true so $filter=fields/vendor_id eq '...' is fast and the upsert path is correct.

export const SCOUT_SCORES_LIST = {
  displayName: "SCOUT-Scores",
  description: "Daily SCOUT score snapshot per vendor (driven by SCOUT pipeline)",
  list: { template: "genericList" },
  columns: [
    {
      name: "vendor_id",
      text: { allowMultipleLines: false, maxLength: 64 },
      indexed: true,
      enforceUniqueValues: true
    },
    { name: "title", text: {} },
    { name: "run_id", text: { maxLength: 128 } },
    { name: "run_date", dateTime: { format: "dateOnly" } },
    { name: "as_of_date", dateTime: { format: "dateOnly" } },
    { name: "freshness_status", text: { maxLength: 16 } },
    { name: "tier", text: { maxLength: 16 } },
    { name: "trend", text: { maxLength: 16 } },
    { name: "status", text: { maxLength: 32 } },
    { name: "total_score", number: { decimalPlaces: "two" } },
    { name: "maturity_score", number: { decimalPlaces: "two" } },
    { name: "integration_score", number: { decimalPlaces: "two" } },
    { name: "governance_score", number: { decimalPlaces: "two" } },
    { name: "confidence", number: { decimalPlaces: "two" } },
    { name: "evidence_count", number: { decimalPlaces: "none" } }
  ]
};

// SharePoint folder layout under the Documents drive.
export const SCOUT_FOLDERS = ["SCOUT", "SCOUT/config", "SCOUT/data", "SCOUT/reports", "SCOUT/reports/weekly", "SCOUT/logs"];
