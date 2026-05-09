require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask Tesla AI anything")
    .addStringOption(option =>
      option.setName("question").setDescription("Your question").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Create a giveaway")
    .addStringOption(option =>
      option.setName("prize").setDescription("Prize").setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("minutes").setDescription("How many minutes").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("image")
    .setDescription("Create an AI image")
    .addStringOption(option =>
      option.setName("prompt").setDescription("Describe the image").setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );

  console.log("Tesla commands uploaded successfully.");
})();