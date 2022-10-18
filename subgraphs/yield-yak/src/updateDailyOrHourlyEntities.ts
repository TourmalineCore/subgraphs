import { Address, BigInt } from "@graphprotocol/graph-ts";
import { YakStrategyV2 } from "../generated/YakStrategyV2/YakStrategyV2";
import { calculatePriceInUSD, calculateOutputTokenPriceInUSD } from "./helpers/calculators";
import { convertBINumToDesiredDecimals } from "./helpers/converters";
import { DEFUALT_AMOUNT, ZERO_BIGDECIMAL, ZERO_BIGINT } from "./utils/constants";
import { 
    defineAccount,
    defineActiveAccount,
    defineProtocol, 
    defineVault, 
    defineVaultDailySnapshot, 
    defineVaultHourlySnapshot,
    defineUsageMetricsDailySnapshotEntity,
    defineUsageMetricsHourlySnapshot,
    defineFinancialsDailySnapshotEntity
} from "./utils/initial";

export function updateDailyOrHourlyEntities(contractAddress: Address, 
    timestamp: BigInt, 
    blockNumber: BigInt): void {
    protocolUpdater(contractAddress)
    vaultUpdater(contractAddress, timestamp, blockNumber)
    vaultDailySnapshotUpdater(contractAddress, timestamp, blockNumber)
    vaultHourlySnapshotUpdater(contractAddress, timestamp, blockNumber)
    usageMetricsDailySnapshotUpdater(contractAddress, timestamp, blockNumber)
    usageMetricsHourlySnapshotUpdater(contractAddress, timestamp, blockNumber)
    financialsDailySnapshotUpdater(contractAddress, timestamp, blockNumber)
  }

  function protocolUpdater(contractAddress: Address): void {
    let dexStrategyV4Contract = YakStrategyV2.bind(contractAddress);
    let protocol = defineProtocol(contractAddress);
    if (dexStrategyV4Contract.try_depositToken().reverted) {
      protocol.totalValueLockedUSD = ZERO_BIGDECIMAL;
    } else {
      protocol.totalValueLockedUSD = calculatePriceInUSD(dexStrategyV4Contract.depositToken(), DEFUALT_AMOUNT).times(convertBINumToDesiredDecimals(dexStrategyV4Contract.totalDeposits(), 18));
    }
    let isAccountUniqe = defineAccount(contractAddress);
    protocol.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers + isAccountUniqe.toI32();
    protocol.save();
  }

  function vaultUpdater(contractAddress: Address, 
    timestamp: BigInt, 
    blockNumber: BigInt): void {
    let dexStrategyV4Contract = YakStrategyV2.bind(contractAddress);
    let vault = defineVault(contractAddress, timestamp, blockNumber);
  
    if (dexStrategyV4Contract.try_totalSupply().reverted) {
      vault.outputTokenSupply = ZERO_BIGINT;
      vault.stakedOutputTokenAmount = ZERO_BIGINT;
    } else {
      vault.outputTokenSupply = dexStrategyV4Contract.totalSupply();
      vault.stakedOutputTokenAmount = dexStrategyV4Contract.totalSupply();
    }
    if (dexStrategyV4Contract.try_totalDeposits().reverted) {
      vault.inputTokenBalance = ZERO_BIGINT;
    } else {
      vault.inputTokenBalance = dexStrategyV4Contract.totalDeposits();
      if (dexStrategyV4Contract.try_depositToken().reverted) {
        vault.totalValueLockedUSD = ZERO_BIGDECIMAL;
      } else {
        vault.totalValueLockedUSD = calculatePriceInUSD(dexStrategyV4Contract.depositToken(), DEFUALT_AMOUNT).times(convertBINumToDesiredDecimals(dexStrategyV4Contract.totalDeposits(), 18));
      }
    }
    if (dexStrategyV4Contract.try_getDepositTokensForShares(DEFUALT_AMOUNT).reverted) {
      vault.pricePerShare = ZERO_BIGDECIMAL;
    } else {
      vault.pricePerShare = convertBINumToDesiredDecimals(dexStrategyV4Contract.getDepositTokensForShares(DEFUALT_AMOUNT), 18);
    }
    vault.outputTokenPriceUSD = calculateOutputTokenPriceInUSD(contractAddress);
  
    vault.save();
  }

  function vaultDailySnapshotUpdater(contractAddress: Address, 
    timestamp: BigInt, 
    blockNumber: BigInt): void {
    let dexStrategyV4Contract = YakStrategyV2.bind(contractAddress);
    let vaultDailySnapshotEntity = defineVaultDailySnapshot(timestamp, blockNumber, contractAddress);
    if (dexStrategyV4Contract.try_totalSupply().reverted) {
      vaultDailySnapshotEntity.outputTokenSupply = ZERO_BIGINT;
    } else {
      vaultDailySnapshotEntity.outputTokenSupply = dexStrategyV4Contract.totalSupply();
    }
  
    if (dexStrategyV4Contract.try_totalSupply().reverted) {
      vaultDailySnapshotEntity.outputTokenSupply = ZERO_BIGINT;
      vaultDailySnapshotEntity.stakedOutputTokenAmount = ZERO_BIGINT;
    } else {
      vaultDailySnapshotEntity.outputTokenSupply = dexStrategyV4Contract.totalSupply();
      vaultDailySnapshotEntity.stakedOutputTokenAmount = dexStrategyV4Contract.totalSupply();
    }
    if (dexStrategyV4Contract.try_totalDeposits().reverted) {
      vaultDailySnapshotEntity.inputTokenBalance = ZERO_BIGINT;
    } else {
      vaultDailySnapshotEntity.inputTokenBalance = dexStrategyV4Contract.totalDeposits()
      if (dexStrategyV4Contract.try_depositToken().reverted) {
        vaultDailySnapshotEntity.totalValueLockedUSD = ZERO_BIGDECIMAL;
      } else {
        vaultDailySnapshotEntity.totalValueLockedUSD = calculatePriceInUSD(dexStrategyV4Contract.depositToken(), DEFUALT_AMOUNT).times(convertBINumToDesiredDecimals(dexStrategyV4Contract.totalDeposits(), 18));
      }
    }
    if (dexStrategyV4Contract.try_getDepositTokensForShares(DEFUALT_AMOUNT).reverted) {
      vaultDailySnapshotEntity.pricePerShare = ZERO_BIGDECIMAL;
    } else {
      vaultDailySnapshotEntity.pricePerShare = convertBINumToDesiredDecimals(dexStrategyV4Contract.getDepositTokensForShares(DEFUALT_AMOUNT), 18);
    }
    vaultDailySnapshotEntity.outputTokenPriceUSD = calculateOutputTokenPriceInUSD(contractAddress);
  
    vaultDailySnapshotEntity.save();
  }

  function vaultHourlySnapshotUpdater(contractAddress: Address,
    timestamp: BigInt, 
    blockNumber: BigInt): void {
    let dexStrategyV4Contract = YakStrategyV2.bind(contractAddress);
    let vaultHourlySnapshotEntity = defineVaultHourlySnapshot(timestamp, blockNumber, contractAddress);
    if (dexStrategyV4Contract.try_totalSupply().reverted) {
      vaultHourlySnapshotEntity.outputTokenSupply = ZERO_BIGINT;
      vaultHourlySnapshotEntity.stakedOutputTokenAmount = ZERO_BIGINT;
    } else {
      vaultHourlySnapshotEntity.outputTokenSupply = dexStrategyV4Contract.totalSupply();
      vaultHourlySnapshotEntity.stakedOutputTokenAmount = dexStrategyV4Contract.totalSupply();
    }
    if (dexStrategyV4Contract.try_totalDeposits().reverted) {
      vaultHourlySnapshotEntity.inputTokenBalance = ZERO_BIGINT;
    } else {
      vaultHourlySnapshotEntity.inputTokenBalance = dexStrategyV4Contract.totalDeposits()
      if (dexStrategyV4Contract.try_depositToken().reverted) {
        vaultHourlySnapshotEntity.totalValueLockedUSD = ZERO_BIGDECIMAL;
      } else {
        vaultHourlySnapshotEntity.totalValueLockedUSD = calculatePriceInUSD(dexStrategyV4Contract.depositToken(), DEFUALT_AMOUNT).times(convertBINumToDesiredDecimals(dexStrategyV4Contract.totalDeposits(), 18));
      }
    }
    if (dexStrategyV4Contract.try_getDepositTokensForShares(DEFUALT_AMOUNT).reverted) {
      vaultHourlySnapshotEntity.pricePerShare = ZERO_BIGDECIMAL;
    } else {
      vaultHourlySnapshotEntity.pricePerShare = convertBINumToDesiredDecimals(dexStrategyV4Contract.getDepositTokensForShares(DEFUALT_AMOUNT), 18);
    }
    vaultHourlySnapshotEntity.outputTokenPriceUSD = calculateOutputTokenPriceInUSD(contractAddress);
  
    vaultHourlySnapshotEntity.save();
  }

  function usageMetricsDailySnapshotUpdater(contractAddress: Address, 
    timestamp: BigInt, 
    blockNumber: BigInt): void {
    let protocol = defineProtocol(contractAddress);
    let isDailyAccountUniqe = defineActiveAccount(contractAddress, timestamp, "d");
    let usageMetricsDailySnapshotEntity = defineUsageMetricsDailySnapshotEntity(timestamp, blockNumber, contractAddress);
    usageMetricsDailySnapshotEntity.dailyTransactionCount = usageMetricsDailySnapshotEntity.dailyTransactionCount + 1;
    usageMetricsDailySnapshotEntity.dailyActiveUsers = usageMetricsDailySnapshotEntity.dailyActiveUsers + isDailyAccountUniqe.toI32();
    usageMetricsDailySnapshotEntity.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetricsDailySnapshotEntity.save();
  }

  function usageMetricsHourlySnapshotUpdater(contractAddress: Address, 
    timestamp: BigInt, 
    blockNumber: BigInt): void {
    let protocol = defineProtocol(contractAddress);
    let isHourlyAccountUniqe = defineActiveAccount(contractAddress, timestamp, "h");
    let usageMetricsHourlySnapshotEntity = defineUsageMetricsHourlySnapshot(timestamp, blockNumber, contractAddress);
    usageMetricsHourlySnapshotEntity.hourlyTransactionCount = usageMetricsHourlySnapshotEntity.hourlyTransactionCount + 1;
    usageMetricsHourlySnapshotEntity.hourlyActiveUsers = usageMetricsHourlySnapshotEntity.hourlyActiveUsers + isHourlyAccountUniqe.toI32();
    usageMetricsHourlySnapshotEntity.cumulativeUniqueUsers = protocol.cumulativeUniqueUsers;
    usageMetricsHourlySnapshotEntity.save();
  }

  function financialsDailySnapshotUpdater(contractAddress: Address, 
    timestamp: BigInt, 
    blockNumber: BigInt): void {
    let protocol = defineProtocol(contractAddress);
    let dexStrategyV4Contract = YakStrategyV2.bind(contractAddress);
    let financialsDailySnapshotEntity = defineFinancialsDailySnapshotEntity(timestamp, blockNumber, contractAddress);
    financialsDailySnapshotEntity.cumulativeSupplySideRevenueUSD = protocol.cumulativeSupplySideRevenueUSD;
    financialsDailySnapshotEntity.cumulativeProtocolSideRevenueUSD = protocol.cumulativeProtocolSideRevenueUSD;
    financialsDailySnapshotEntity.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD;
    financialsDailySnapshotEntity.totalValueLockedUSD = calculatePriceInUSD (dexStrategyV4Contract.depositToken(), DEFUALT_AMOUNT).times(convertBINumToDesiredDecimals(dexStrategyV4Contract.totalDeposits(), 18));
    financialsDailySnapshotEntity.save();
  }