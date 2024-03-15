const { Connection, clusterApiUrl } = require("@solana/web3.js");

// Initialize connection
const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

/**
 * Fetch parsed transactions from the Solana blockchain.
 * @param {Array} transactionSignatures An array of transaction signatures to fetch.
 * @param {number} maxSupportedTransactionVersion Maximum supported transaction version (default is 0).
 * @returns {Promise<Array>} A promise that resolves to an array of parsed transactions.
 */
async function fetchParsedTransactions(
  transactionSignatures,
  maxSupportedTransactionVersion = 0
) {
  const config = {
    commitment: "confirmed",
    maxSupportedTransactionVersion,
  };

  try {
    return await connection.getParsedTransactions(
      transactionSignatures,
      config
    );
  } catch (error) {
    console.error("Failed to fetch parsed transactions:", error);
    throw error;
  }
}

/**
 * Process and log details of each transaction.
 * @param {Array} transactions An array of transactions to process.
 */

function processTransactions(transactions) {
  transactions.forEach((transaction) => {
    if (!transaction || !transaction.meta) return;

    console.log("*=".repeat(45));
    switch (transaction.version) {
      case 0:
        console.log(`[Transaction Version]`, transaction.version);
        console.log(`[Decoding response from the server ⌛⏳]`);

        if (!transaction.meta.innerInstructions) return;

        transaction.meta.innerInstructions.forEach((innerInstruction) => {
          innerInstruction.instructions.forEach((instruction) => {
            if (!instruction.parsed) return;

            const parsedInfo = instruction.parsed;
            if (
              parsedInfo.type === "transferChecked" &&
              parsedInfo.info &&
              parsedInfo.info.mint ===
                "H24RXEMJ6TK61NrbMZoNxMj2u3yaxJcVMSM65AqfUj9o"
            ) {
              console.log(parsedInfo.info);
            }
          });
        });
        break;
      case "legacy":
        console.log(`[Transaction Version]`, transaction.version);
        break;
      default:
        console.log("Unknown transaction version:", transaction.version);
    }
  });
}

(async () => {
  try {
    const transactionSignatures = [
      "5ugM5FkKtEgHNja7wQtgFc1BQ1UERB6Eh1yuUfKABfSrdNFBwhUD9QPtFEPLZJBRSwKy63EfPHNg7QkR3tyKZzYP",
      "5i6i4vbJkHk13HnimmtGDjdZpvXvEbimT55U6Li37zH3zJJTG6rfAJkGuHBjxmrPqrp4ZVXUYh2hZTPiHuLC9bim",
    ];
    const parsedTransactions = await fetchParsedTransactions(
      transactionSignatures
    );
    processTransactions(parsedTransactions);
  } catch (error) {
    console.error("Error processing transactions:", error);
  }
})();
