"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import HeaderEarnDetail from "@/components/details/HeaderEarnDetail";
import InfosEarnDetails from "@/components/details/InfosEarnDetail";
import DetailEarnMoreTable from "@/components/moreTable/DetailEarnMoreTable";
// import { fetchVault, fetchMarkets } from "@/utils/graph";
import { InvestmentData, VaultBreakdown } from "@/types";
import { formatTokenValue, getPremiumLltv, formatCurator } from "@/utils/utils";
import {
  getVaultDetail,
  getMarketData,
  fetchMarkets,
  fetchVault,
} from "@/utils/contract";

const EarnDetailPage: React.FC = () => {
  const router = useRouter();
  const params = usePathname();

  const [totalBorrow, setTotalBorrow] = useState(0);
  const [breakdowns, setBreakdowns] = useState<VaultBreakdown[]>([]);
  const [vaultInfo, setVaultInfo] = useState<InvestmentData | null>(null);

  const vaultId = params ? params.replace("/earn/", "") : "";

  useEffect(() => {
    const initVault = async () => {
      try {
        if (vaultId.length == 0) {
          router.push("/earn");
        } else {
          const [fetchedVault, marketsArr] = await Promise.all([
            fetchVault(vaultId),
            fetchMarkets(),
          ]);

          const deposited = (await getVaultDetail(
            vaultId,
            "totalAssets",
            []
          )) as bigint;

          if (fetchedVault) {
            const breakdownList = fetchedVault.supplyQueue.map(
              async (queueItem) => {
                const marketId = queueItem.market.id.toLowerCase();
                const marketItem = marketsArr.find(
                  (item) => item.id.toLowerCase() == marketId
                );

                if (marketItem) {
                  const marketData = await getMarketData(marketItem.id);

                  return {
                    id: marketId,
                    allowcation: 0,
                    supply: formatTokenValue(
                      marketData.info.totalSupplyAssets,
                      fetchedVault.asset.id
                    ),
                    borrow: formatTokenValue(
                      marketData.info.totalBorrowAssets,
                      fetchedVault.asset.id
                    ),
                    supplyToken: fetchedVault.asset.id,
                    collateral: marketItem.inputToken.id,
                    lltv: formatTokenValue(BigInt(marketItem.lltv), "", 18),
                    lltv2: getPremiumLltv(marketData.params),
                    credora: "rating",
                  } as VaultBreakdown;
                }
              }
            );

            const filtered = (await Promise.all(breakdownList)).filter(
              (item) => item !== undefined
            );

            let totalSupply = 0;
            let totalBorrows = 0;
            for (const breakdown of filtered) {
              totalSupply += breakdown.supply;
              totalBorrows += breakdown.borrow;
            }
            setTotalBorrow(totalBorrows);

            const updated = filtered.map((item) => {
              return {
                ...item,
                allowcation:
                  totalSupply > 0
                    ? (Number(item.supply) * 100) / totalSupply
                    : "0",
              } as VaultBreakdown;
            });
            setBreakdowns(updated);

            setVaultInfo({
              vaultId: fetchedVault.id,
              vaultName: fetchedVault.name,
              assetAddress: fetchedVault.asset.id,
              netAPY: 0,
              userDeposits: 0,
              userShares: BigInt(0),
              totalDeposits: formatTokenValue(deposited, fetchedVault.asset.id),
              totalValueUSD: 0,
              curator: formatCurator(fetchedVault),
              collateral: [],
              guardian: fetchedVault.guardian ? fetchedVault.guardian.id : "",
            } as InvestmentData);
          }
        }
      } catch (err) {
        router.push("/earn");
      }
    };

    initVault();
  }, [vaultId]);

  const updateInfo = async (id: string) => {
    if (vaultInfo) {
      const deposited = (await getVaultDetail(
        vaultId,
        "totalAssets",
        []
      )) as bigint;

      setVaultInfo({
        ...vaultInfo,
        totalDeposits: formatTokenValue(deposited, vaultInfo.assetAddress),
      } as InvestmentData);
    }
  };

  return (
    <>
      {vaultInfo && (
        <>
          <div className="mb-8 overflow-visible">
            <HeaderEarnDetail updateInfo={updateInfo} item={vaultInfo} />
            <InfosEarnDetails vault={vaultInfo} totalBorrow={totalBorrow} />
          </div>
          <h1 className="text-4xl mt-16 mb-8">Vault Breakdown</h1>
          <DetailEarnMoreTable breakdowns={breakdowns} />
        </>
      )}
    </>
  );
};

export default EarnDetailPage;
