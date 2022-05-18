const ethers = require('ethers');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_URL);

console.log('app loaded - test');

//event listeners
document.getElementById("previous").addEventListener('click', () => {
  console.log('get previous');
  updateBlock(currentBlock.number - 1);
});
document.getElementById("block-number-form").addEventListener('submit', (e) => {
  console.log('update block number: ', e.target.firstElementChild.value);
  if (isNaN(e.target.firstElementChild.value)) {
    alert("INVALID BLOCK REQUEST");
  } else updateBlock(+e.target.firstElementChild.value);
});
document.getElementById("next").addEventListener('click', () => {
  console.log('get next');
  updateBlock(currentBlock.number + 1);
});
document.getElementById("latest").addEventListener('click', () => {
  console.log('get latest');
  updateBlock('latest');
});
document.getElementById("block-property").addEventListener('change', () => {

  updateLookup();
});
document.getElementById("number-of-blocks").addEventListener('change', () => {
  updateLookup();
});

async function updateBlock(number) {
  //retrieve block info or keep it the same
  let nextBlock = await provider.getBlockWithTransactions(number);
  //if block doesn't exist, then return
  if (!nextBlock) {
    alert("INVALID BLOCK REQUEST");
    return;
  } else {
    currentBlock = nextBlock;
  }
  console.log(currentBlock);
  const blockNumber = Number(currentBlock.number);
  const timeStamp = (new Date(currentBlock.timestamp * 1000)).toLocaleString("en-us", { timeZoneName: "short" });
  const transactions = currentBlock.transactions.length;
  const { miner } = currentBlock;
  const difficulty = Number(currentBlock._difficulty._hex).toLocaleString("en-us") || currentBlock.difficulty;
  const gasUsedPercentage = Number(((currentBlock.gasUsed).mul(100)).div(currentBlock.gasLimit));
  const gasUsed = `${Number(currentBlock.gasUsed._hex).toLocaleString("en-us")} (${gasUsedPercentage}% of Gas Limit)`
  const gasLimit = Number(currentBlock.gasLimit).toLocaleString("en-us");
  let baseFeeGwei = 'N/A'
  let burntFeesEther = 'N/A'
  if (currentBlock.baseFeePerGas) {
    baseFeeGwei = ethers.utils.formatUnits(currentBlock.baseFeePerGas, 'gwei').toLocaleString("en-us") + ' Gwei';
    burntFeesEther = ethers.utils.formatEther((currentBlock.baseFeePerGas).mul(currentBlock.gasUsed._hex)).toLocaleString("en-us") + ' Ether';
  }
  const { extraData } = currentBlock;

  document.getElementById("block-table").innerHTML = `
    <tr>
      <th>Block Number:</th>
      <th>${blockNumber}</th>
    </tr>
    <tr>
      <td>Timestamp:</td>
      <td>${timeStamp}</td>
    </tr>
    <tr>
      <td>Transactions:</td>
      <td>${transactions}</td>
    </tr>
    <tr>
      <td>Mined By:</td>
      <td>${miner}</td>
    </tr>
    <tr>
      <td>Difficulty:</td>
      <td>${difficulty}</td>
    </tr>
    <tr>
      <td>Gas Used:</td>
      <td>${gasUsed}</td>
    </tr>
    <tr>
      <td>Gas Limit:</td>
      <td>${gasLimit}</td>
    </tr>
    <tr>
      <td>Base Fee Per Gas:</td>
      <td>${baseFeeGwei}</td>
    </tr>
    <tr>
      <td>Burnt Fees:</td>
      <td>${burntFeesEther}</td>
    </tr>
    <tr>
      <td>Extra Data:</td>
      <td>${extraData}</td>
    </tr>
      `;
}

async function updateLookup() {
  const lookupProperty = document.getElementById("block-property").value;
  const numberOfBlocks = document.getElementById("number-of-blocks").value;

  if (!lookupProperty || !numberOfBlocks) return;

  const currentBlockNumber = Number(currentBlock.number);

  let lookupHTML = `
  <tr>
      <th>Block Number:</th>
      <th>${lookupProperty}</th>
    </tr>
    <tr>
      <td>${currentBlockNumber}</td>
      <td>${blockPropertyLookup(lookupProperty, currentBlock)}</td>
    </tr>
  `;
  for (let i = 1; i < numberOfBlocks; i++) {
    const block = await provider.getBlockWithTransactions(currentBlockNumber - i);
    lookupHTML += `<tr>
      <td>${Number(block.number)}</td>
      <td>${blockPropertyLookup(lookupProperty, block)}</td>
    </tr>`;
  }
  document.getElementById("lookup-table").innerHTML = lookupHTML;
}

blockPropertyLookupObj = {
  Timestamp(block) {
  return (new Date(block.timestamp * 1000)).toLocaleString("en-us", { timeZoneName: "short" });
  }
}

function blockPropertyLookup(property, block) {
  if (property === "Timestamp") return (new Date(block.timestamp * 1000)).toLocaleString("en-us", { timeZoneName: "short" });
  if (property === "Transactions") return block.transactions.length;
  if (property === "Mined By") return block.miner;
  if (property === "Difficulty") return Number(block._difficulty._hex).toLocaleString("en-us") || block.difficulty;
  if (property === "Gas Used") {
    const gasUsedPercentage = Number(((block.gasUsed).mul(100)).div(Number(block.gasLimit)));
    const gasUsed = `${Number(block.gasUsed._hex).toLocaleString("en-us")} (${gasUsedPercentage}% of Gas Limit)`
    return gasUsed;
  }
  if (property === "Gas Limit") return Number(block.gasLimit).toLocaleString("en-us");
  if (property === "Base Fee Per Gas") {
    let baseFeeGwei = 'N/A'
    if (block.baseFeePerGas) {
      baseFeeGwei = ethers.utils.formatUnits(block.baseFeePerGas, 'gwei').toLocaleString("en-us") + ' Gwei';
    }
    return baseFeeGwei;
  }
  if (property === "Burnt Fees") {
    let burntFeesEther = 'N/A'
    if (block.baseFeePerGas) {
      burntFeesEther = ethers.utils.formatEther((block.baseFeePerGas).mul(block.gasUsed._hex)).toLocaleString("en-us") + ' Ether';
    }
    return burntFeesEther
  }
  if (property === "Extra Data") return block.extraData;
}

//initiate variable & load current block on page load
let currentBlock;
updateBlock('latest');