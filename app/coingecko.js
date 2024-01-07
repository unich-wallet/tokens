async function setUpCoingecko(networks) {
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