const Discord = require('discord.js');
const bot = new Discord.Client();
const token = require("./token.json");
const bdd = require("./bdd.json");
const fs = require('fs')


bot.on('ready', () => {

    const Statuses = [
        'Bot en développement',
        'Bonne journée/soirée sur Suricate.off®',
        'Les Staff sont que des BG'
    ]

    setInterval(() => {
        const statusBot = Statuses[Math.floor(Math.random() * Statuses.length)]

        bot.user.setPresence({
            activity: {
                name: statusBot,
                type: 3
            },
            status: 'online'
        });
    }, 10000); //ça fais 10secondes
});

bot.on('guildMemberAdd', member => {
    member.send(`Bienvenue ! Vérifie toi dans le <#650301122040299520>. Et lis les règles dans le <#513719822064812043>. Bon voyage !`)
    member.guild.channels.cache.get('520635145959505921').send(`Bienvenue ${member.user.username}`)
})

bot.on("message", message => {
    if (message.content.startsWith("s.clear")) {
        let args = message.content.split(" ");
        if (message.member.permissions.has("MANAGE_MESSAGES"));

        if (args[1] == undefined) {
            message.channel.send("Définissez un nombre de message à supprimer.");
        }
        else {
            let number = parseInt(args[1]);

            if (isNaN(number)) {
                message.channel.send("Définissez un nombre de message à supprimer.");
            }
            else {
                message.channel.bulkDelete(number).then(messages => {
                    let embed = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setTitle('**MESSAGES SUPPRIMÉS**')
                        .setDescription('Suppression de ' + messages.size + " messages réussis dans le salon #" + message.channel.name + '.')
                    const log1 = bot.channels.cache.find(channel => channel.id === '798947328064356364'); // Salon pour les logs //
                    log1.send(embed)
                    console.log("Suppression de " + messages.size + " messages réussis.");
                }).catch(err => {
                    const log1 = bot.channels.cache.find(channel => channel.id === '798947328064356364'); // Salon pour les logs //
                    log1.send("Erreur de clear : " + err)
                    console.log("Erreur de clear : " + err);
                });
            }
        }
    }
});

bot.on('message', message => {
    if (message.content.startsWith("s.warn")) {
        if (message.member.hasPermission('BAN_MEMBERS')) {

            if (!message.mentions.users.first()) return;
            utilisateur = message.mentions.users.first().id

            if (bdd["warn"][utilisateur] == 4) {

                message.guild.members.ban(utilisateur)
            }
            if (!bdd["warn"][utilisateur] == 4) {
                bdd["warn"][utilisateur] = 1
                Savebdd();
                message.channel.send("Tu es a présent a " + bdd["warn"][utilisateur] + " avertissement(s)")
            }
            else {
                bdd["warn"][utilisateur]++
                Savebdd();
                message.channel.send("Tu es a présent a " + bdd["warn"][utilisateur] + " avertissements")
            }
        }
    }
});

bot.on('messageReactionAdd', async (reaction, member) => {
	if(reaction.partial){
            await reaction.fetch();
            console.log(`le message avec l'id : ${reaction.message.id} à bien été restocké dans le cache !` );
            return;
        }
    if (member.bot) return;
    if (reaction.emoji.name == "🎉" && reaction.message.id == bdd["message-event-Minecraft"]) {
        bdd["participants-event-Minecraft"].push(member.id)
        Savebdd()
        member.send('Votre participation au concours à bien été enregistrée !').catch(err => console.log(err));
    }
})
bot.on('messageReactionRemove', (reaction, member) => {
    if (member.bot) return;
    if (reaction.emoji.name == "🎉" && reaction.message.id == bdd["message-event-Minecraft"]) {
        getindex = bdd["participants-event-Minecraft"].indexOf(member.id)
        if (getindex > -1) {
            bdd["participants-event-Minecraft"].splice(getindex, 1);
        }
        Savebdd();
        member.send('Votre désabonnement au concours à bien été enregistré !').catch(err => console.log(err));
    }
})

bot.commands = new Discord.Collection();
// bot.aliases = new Discord.Collection();
fs.readdir("./commands/", (err, files) => {

    if (err) console.log(err);

    let jsfile = files.filter(f => f.split(".").pop() === "js");

    if (jsfile.length <= 0) {
        return console.log("Impossible de trouver des commandes");
    }

    jsfile.forEach((f, i) => {
        let pull = require(`./commands/${f}`);

        bot.commands.set(pull.config.name, pull);

        // pull.config.aliases.forEach(alias => {

        //     bot.aliases.set(alias, pull.config.name)

        // });
    });
});



function Savebdd() {
    fs.writeFile("./bdd.json", JSON.stringify(bdd, null, 4), (err) => {
        if (err) message.channel.send("Une erreur est survenue.");
    });
}
 


bot.login(process.env.token);