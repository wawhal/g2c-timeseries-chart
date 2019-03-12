const fetch = require('node-fetch');

const run = () => {
  setInterval(
    () => {
      fetch(
        'https://graphql2chartjs.herokuapp.com/v1alpha1/graphql',
        {
          method: 'POST',
          body: JSON.stringify({
            query: `
              mutation ($price: numeric){
                insert_stocks (
                  objects:[{
                    name: "Company 1",
                    time: "now()",
                    price: $price
                  }]
                ) {
                  affected_rows
                }
              }
            `,
            variables: {
              price: Math.floor(Math.random() * 20000) + 10000
            }
          }),
          headers: {
            'x-hasura-admin-secret': process.env.ADMIN_SECRET
          }
        }
      ).then((resp) => resp.json()).then((r) => console.log(JSON.stringify(r, null, 2)))
    },
    2000
  );
}

run();
