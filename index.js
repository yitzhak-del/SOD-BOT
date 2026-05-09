require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const OpenAI = require("openai");

if (!process.env.DISCORD_TOKEN || !process.env.OPENAI_API_KEY) {
  console.error("Missing DISCORD_TOKEN or OPENAI_API_KEY in .env");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

client.once("ready", () => {
  console.log(`Tesla is online as ${client.user.tag}`);
});

async function askTesla(question) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are Tesla, a smart Discord AI bot. Answer in Hebrew, short, clear, friendly and helpful."
      },
      {
        role: "user",
        content: question
      }
    ],
    max_tokens: 500
  });

  return response.choices[0]?.message?.content || "לא הצלחתי לענות על זה.";
}

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.trim()) return;

  const question = message.content.trim();

  try {
    await message.channel.sendTyping();
    const answer = await askTesla(question);
    await message.reply(answer);
  } catch (err) {
    console.error("Message error:", err);
    await message.reply("הייתה שגיאה עם Tesla. כנראה אין קרדיט ב־OpenAI או שה־API Key לא תקין.");
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ask") {
    const question = interaction.options.getString("question");

    await interaction.deferReply();

    try {
      const answer = await askTesla(question);
      await interaction.editReply(answer);
    } catch (err) {
      console.error("Ask error:", err);
      await interaction.editReply("הייתה שגיאה עם Tesla. תבדוק קרדיט ב־OpenAI ו־API Key.");
    }
  }

  if (interaction.commandName === "giveaway") {
    const prize = interaction.options.getString("prize");
    const minutes = interaction.options.getInteger("minutes");

    await interaction.deferReply();

    const embed = new EmbedBuilder()
      .setTitle("🎉 GIVEAWAY 🎉")
      .setDescription(`**Prize:** ${prize}\n\nלחצו 🎉 כדי להשתתף!\n\nנגמר בעוד **${minutes} דקות**`)
      .setColor(0x00bfff)
      .setFooter({ text: `Started by ${interaction.user.tag}` });

    const giveawayMessage = await interaction.editReply({
      embeds: [embed]
    });

    await giveawayMessage.react("🎉");

    setTimeout(async () => {
      try {
        const message = await interaction.channel.messages.fetch(giveawayMessage.id);
        const reaction = message.reactions.cache.get("🎉");

        if (!reaction) {
          return interaction.followUp("לא היו משתתפים בהגרלה.");
        }

        const users = await reaction.users.fetch();
        const participants = users.filter(user => !user.bot);

        if (participants.size === 0) {
          return interaction.followUp("לא היו משתתפים בהגרלה.");
        }

        const winner = participants.random();
        await interaction.followUp(`🎉 הזוכה ב־**${prize}** הוא ${winner}!`);
      } catch (err) {
        console.error("Giveaway error:", err);
        await interaction.followUp("הייתה שגיאה בסיום ההגרלה.");
      }
    }, minutes * 60 * 1000);
  }

  if (interaction.commandName === "image") {
    const prompt = interaction.options.getString("prompt");

    await interaction.deferReply();

    try {
      const image = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024"
      });

      const buffer = Buffer.from(image.data[0].b64_json, "base64");

      const attachment = new AttachmentBuilder(buffer, {
        name: "tesla-image.png"
      });

      await interaction.editReply({
        content: `✅ התמונה מוכנה:\n**Prompt:** ${prompt}`,
        files: [attachment]
      });
    } catch (err) {
      console.error("Image error:", err);
      await interaction.editReply("הייתה שגיאה ביצירת התמונה. צריך לבדוק קרדיט או גישה ל־Images API.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);