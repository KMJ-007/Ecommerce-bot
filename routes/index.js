const venom = require('venom-bot');
const EcommerceStore = require("./../utils/mesegeParsing.js");
const CustomerSession = new Map();

venom
    .create({
        session: 'Test-Session', //name of session
        multidevice: true // for version not multidevice use false.(default: true)
    })
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

let Store = new EcommerceStore();


function start(client) {
    client.onMessage(async (message) => {
        console.log(message);
        let data = message;
        if (data && message.isGroupMsg === false) {
            let incomingMessage = data.body;
            let recipientPhone = data.from; // extract the phone number of sender
            let recipientName = data.notifyName;
            let typeOfMsg = data.type; // extract the type of message (some are text, others are images, others are responses to buttons etc...)
            let message_id = data.chatId; // extract the message id
            
            if (!CustomerSession.get(recipientPhone)) {
              CustomerSession.set(recipientPhone, {
                cart: [],
              });
            }
            let addToCart = async ({ product_id, recipientPhone }) => {
                let product = await Store.getProductById(product_id);
                if (product.status === "success") {
                  CustomerSession.get(recipientPhone).cart.push(product.data);
                }
              };
        
              let listOfItemsInCart = ({ recipientPhone }) => {
                let total = 0;
                let products = CustomerSession.get(recipientPhone).cart;
                total = products.reduce((acc, product) => acc + product.price, total);
                let count = products.length;
                return { total, products, count };
              };
        
              let clearCart = ({ recipientPhone }) => {
                CustomerSession.get(recipientPhone).cart = [];
              };
              if (typeOfMsg === "chat" && message.isGroupMsg === false) {
                await client
                .sendText(message.from, `Hey ${recipientName}, \nYou are speaking to a chatbot.\nWhat do you want to do next?`)
                .then((result) => {
                    console.log(' Welcome message from ', message.from); //return object success
                })
                .catch((erro) => {
                    console.error('Error when sending: ', erro); //return object error
                });

            const welcomeList = [
                {
                    "buttonText": {
                        "displayText": "View some products",
                    }
                },
                
                
            ]
            await client.sendButtons(message.from, 'What brings you to us ?', welcomeList, 'It brings us immense pleasure to be of help to you! 😊You can choose from the below mentioned options, relevant to your query:')
                .then((result) => {
                    console.log('Result: ', result); //return object success
                })
                .catch((erro) => {
                    console.error('Error when sending: ', erro); //return object error
                });
              }
              // for button response
              if (typeOfMsg === "buttons_response") {
                console.log("hey it is button response")
                console.log(incomingMessage)
                    if(incomingMessage == "View some products"){
                        console.log("hey someone is asking for products")
                        let categories = await Store.getAllCategories();
                        
                        const categoryList = categories.data
                        .map((category) => ({
                            title: category,
                            id: `category_${category}`,
                            rows: [
                                { title: `category_${category}`, description: "" }
                            ]
                        }));
                        await client.sendListMenu(message.from, '', '', 'We have several categories.\nChoose one of them.', 'Select', categoryList)
                            .then((result) => {
                                console.log('Result: ', result); //return object success
                                console.log("A List is requested from " + message.from);
                            })
                    }
                    
              }

              //for list response 
              if(typeOfMsg =="list_response"){
                if(incomingMessage.startsWith("category_")){
                    console.log("hey someone is asking for category");
                    let selectedCategory = incomingMessage.split("category_")[1];
                    let listOfProducts = await Store.getProductsInCategory(
                        selectedCategory
                    );
                    let listOfSections = [
                        {
                          title: `🏆 Top 3: ${selectedCategory}`.substring(0, 24),
                          rows: listOfProducts.data
                            .map((product) => {
                              let id = `product_${product.id}`.substring(0, 256);
                              let title = product.title.substring(0, 21);
                              let description =
                                `${product.price}\n${product.description}`.substring(0, 68);
            
                              return {
                                id,
                                title: `${title}...`,
                                description: `$${description}...`,
                              };
                            })
                            .slice(0, 10),
                        },
                      ];
                      
                      await client.sendListMenu(message.from, selectedCategory, '', '`Our Santa 🎅🏿 has lined up some great products for you based on your previous shopping history.\n\nPlease select one of the products below:`', 'menu', listOfSections)
                        .then((result) => {
                            // console.log('Result: ', result); //return object success
                            console.log("A List is requested from " + message.from);
                        })
                }
              }
        }
    });
}
