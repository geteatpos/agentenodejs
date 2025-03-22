// const axios = require("axios");
// const FormData = require("form-data");

// const clientId = "9mc3yLAblf_6c5R0gscNDxoaux_D1gVi";
// const clientSecret = "9Z_1Zyp9YnR6h1NPqlJ3y4x9NMCXZStyvaQxC_vH";

// async function obtenerTokenUber() {
//   const form = new FormData();
//   form.append("client_id", clientId);
//   form.append("client_secret", clientSecret);
//   form.append("grant_type", "client_credentials");
//   form.append("scope", "eats.deliveries direct.organizations");

//   try {
//     const respuesta = await axios.post(
//       "https://login.uber.com/oauth/v2/token",
//       form,
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );

//     console.log("Token recibido:", respuesta.data);
//   } catch (error) {
//     console.error(
//       "Error al obtener el token:",
//       error.response ? error.response.data : error.message
//     );
//   }
// }

// obtenerTokenUber();

// const axios = require("axios");

// const customerId = "9mc3yLAblf_6c5R0gscNDxoaux_D1gVi";
// const token = "IA.VUNmGAAAAAAAEgASAAAABwAIAAwAAAAAAAAAEgA…gwMy0zOGEwLTQyYjMtODA2ZS03YTRjZjhlMTk2ZWU";

const axios = require("axios");



const customerId = "9mc3yLAblf_6c5R0gscNDxoaux_D1gVi";
const token =
  "IA.VUNmGAAAAAAAEgASAAAABwAIAAwAAAAAAAAAEgAAAAAAAAGwAAAAFAAAAAAADgAQAAQAAAAIAAwAAAAOAAAAhAAAABwAAAAEAAAAEAAAAJVqGvYvL-F-cjW_vkX-FvFfAAAA9AadRPFcV_wXfXzS17Q55IyFSfguEfRc00Ffw7VmmZvsvcf8YW1rNj5WckqPcsJzao9KcRYtObWz41AVVpmJudJ_O2TCwvbGF2F4eYxfJp0_TwjlbnIblGnOXbcSD20ADAAAAL4QsN-qrLt0FDZDGiQAAABiMGQ4NTgwMy0zOGEwLTQyYjMtODA2ZS03YTRjZjhlMTk2ZWU";

const url = `https://api.uber.com/v1/customers/${customerId}/deliveries`;


const requestBody = {
  pickup_name: "Test Store",
  pickup_address: "100 Maiden Ln, New York, NY 10038",
  pickup_phone_number: "+15555555555",
  dropoff_name: "John Doe",
  dropoff_address: "30 Lincoln Center Plaza, New York, NY 10023",
  dropoff_phone_number: "+15555555555",
  manifest_items: [
    {
      name: "Test Item",
      quantity: 1,
      size: "small",
    },
  ],
  pickup_latitude: 40.7066745,
  pickup_longitude: -74.0071976,
  dropoff_latitude: 40.7727076,
  dropoff_longitude: -73.9839082,
  manifest_total_value: 1000,
  deliverable_action: "deliverable_action_meet_at_door",
  test_specifications: {
    robo_courier_specification: { mode: "auto" },
  },
};

const config = {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
};

axios
  .post(url, requestBody, config)
  .then((response) => {
    console.log("Delivery creado exitosamente:", response.data);
  })
  .catch((error) => {
    console.error(
      "Error al crear el delivery:",
      error.response ? error.response.data : error.message
    );
  });
