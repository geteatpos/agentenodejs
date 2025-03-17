import Fastify from "fastify";

const fastify = Fastify({ logger: true });

fastify.post("/twilio-webhook", async (request, reply) => {
  const { caller_id, agent_id, called_number, call_sid } = request.body;

  // Simulate fetching dynamic variables from a database or other service
  const dynamicVariables = {
    customer_name: "John Doe",
    account_status: "premium",
    last_interaction: "2024-01-15",
  };

  // Construct the response
  const responsePayload = {
    dynamic_variables: dynamicVariables,
    conversation_config_override: {
      agent: {
        prompt: {
          prompt:
            "The customer's bank account balance is $100. They are based in San Francisco.",
        },
        first_message: "Hi, how can I help you today?",
        language: "en",
      },
      tts: {
        voice_id: "new-voice-id",
      },
    },
  };

  reply.send(responsePayload);
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server running on port 3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
