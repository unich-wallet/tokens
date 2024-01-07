import { get } from "./fetch.js";
import { promises as fs } from "fs";
//gecko section
async function buildNetworkFile() {
  const dir = "./networks";
  const files = await fs.readdir(dir);
  let networks = [];
  await Promise.all(
    files.map(async (file) => {
      const networkDir = `${dir}/${file}/info.json`;
      const nativeDir = `${dir}/${file}/native/info.json`;
      const data = await fs.readFile(networkDir, { encoding: "utf-8" });
      const nativeData = JSON.parse(
        await fs.readFile(nativeDir, { encoding: "utf-8" })
      );
      networks.push({
        ...JSON.parse(data),
        network_id: file,
        name: nativeData.name,
        description: nativeData.description,
        explorer: nativeData.explorer,
      });
    })
  );
  const clonedNetworks = structuredClone(networks)
  networks.map((n)=> {
    delete n.external_data_sources
  })
  fs.writeFile("networks.json", JSON.stringify(networks), "utf-8");
  console.log({clonedNetworks})
  return clonedNetworks;
}
async function mapGeckoPlatform(networks) {
  const platformsData = await get(
    `https://api.coingecko.com/api/v3/asset_platforms`
  );
  const coinsData = await get(
    `https://api.coingecko.com/api/v3/coins/list?include_platform=true`
  );
  const results = [];
  networks.map((n) => {
    //native
    if(n.network_id==='bitcoin'){
        results.push({
            token_id: n.network_id,
            network_id: n.network_id,
            gecko_id: 'bitcoin',
        })
        return
    }
    const platform = platformsData.find(
      (d) => d.id === n.external_data_sources.coingecko_id
    );
    results.push({
      token_id: n.network_id,
      network_id: n.network_id,
      gecko_id: platform.native_coin_id,
    });
    //tokens
    const coins = Array.from(coinsData).filter(
        (c) => n.external_data_sources.coingecko_id in c.platforms
      );
      coins.map((c) => {
        results.push({
          token_id: `${n.network_id}-${
            c.platforms[n.external_data_sources.coingecko_id]
          }`, //no sum address
          network_id: n.network_id,
          gecko_id: c.id,
        });
      });
  });
  fs.writeFile("tokens.json", JSON.stringify(results), "utf-8");
  console.log({results})
  return results;
}
// mapGeckoPlatform()