const fastify = require("fastify")({ logger: true });

// Define the webhook endpoint
fastify.post("/get-personal", async (request, reply) => {
	console.log("Datos recibidos de Twilio:", request.body);
	// Extract data from the request body
	const { caller_id, agent_id, called_number, call_sid } = request.body;

	// Prepare the response data
	reply.send = {
		dynamic_variables: {
			customer_name: "Alpidio Doe",
			account_status: "premium",
			last_interaction: "2024-01-15",
		},
		conversation_config_override: {
			agent: {
				prompt: {
					prompt:
						"The customer's bank account balance is $100. They are based in San Francisco.",
				},
				first_message: "Hi, how can I help you today?",

			},
     
		},
	};





	
	//   // Send the JSON response
	//   return reply.send(responseData);
	// });

	// // Start the server
	// const start = async () => {
	//   try {
	//     await fastify.listen({ port: 3000 });
	//     fastify.log.info(`Server listening on http://localhost:3000`);
	//   } catch (err) {
	//     fastify.log.error(err);
	//     process.exit(1);
	//   }
	// };

	// start();
});	