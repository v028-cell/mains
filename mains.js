import { ArchwayClient } from '@archwayhq/arch3.js';
import { SigningArchwayClient } from '@archwayhq/arch3.js';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import axios from 'axios';

const network = {
  chainId: 'constantine-3',
  endpoint: 'https://rpc.constantine.archway.tech',
  prefix: 'archway',
};

// ------------------------
// Этой части кода не должно быть на фронте, мы это используем 
// в тесте работы со смартконтрактом, чтобы не подключать кошелек, 
// а использовать его объект из мнемоники

const mnemonic = 'core wear goose congress elephant afraid amazing diet holiday crush better expect provide envelope involve slide hotel prepare dad zoo fatal media cute already';
const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: network.prefix });
const accounts = await wallet.getAccounts();
console.log(accounts);
// ------------------------


// разные клиенты для примера
// с wallet - для выполнение транзакций от юзера (создания, покупка/продажа, удаление и тд)
// без wallet - readonly транзакции, получение коллекций, нфт и тд
const client = await SigningArchwayClient.connectWithSigner(network.endpoint, wallet);
const clientWithoutWallet = await SigningArchwayClient.connectWithSigner(network.endpoint);

const hubContractAddress = 'archway1hwflc4hy67gtn9e2n83qvp3krjwavjpcammajatgseq5xf6q4wwqnyq4md';
const marketContractAddress = 'archway10c9stgxme8apm9mnzxnukmycf83l82fh7clzjsvxvrcv6jzykees34whf2';


// Создание коллекции
// Вроде бы все поля обязательные, категории как массив
// Создается только от whitelisted кошельков, один из них в мнемонике выше
// minter - обладатель контракта. Только он сможет создавать нфт в этой коллекции
const msg = {
  create_collection: {
    "init": {
      "name": "TestCollection",
      "symbol": "TC",
      "minter": accounts[0].address,
      "metadata": {
        "banner": "test",
        "profile_image": "test",
        "description": "TestCollection",
        "categories": ["Art"],
        "website": "link",
        "explicit_content": true
      },
    },
    "label": "Test"
  },
};

// const { transactionHash } = await client.execute(
//   accounts[0].address,
//   hubContractAddress,
//   msg,
//   "auto"
// );


// Выполнение транзакции без подключенного кошелька

const collectionsMsg = {
  collections: {
    "pagination": {
      "limit": 10,
      "order": "ascending",
      "page": "1"
    }
  },
};

const collections = await clientWithoutWallet.queryContractSmart(
  hubContractAddress,
  collectionsMsg
);

console.log(collections);

// Получение всех нфт

const collectionMsg = {
  "all_tokens": {}
};

const collection = await client.queryContractSmart(
  'archway18yt9vlyq95e86vj4g39ws0qzq8gxm0cw80sccfugxta0ve36h4eq3gtfwy',
  collectionMsg
);

console.log(collection);


// Создание нфт
const mintMsg = {
  "mint": {
    token_id: "1",
    owner: accounts[0].address,
    extension: {
      name: "Test",
      description: "test desc",
      image: "test"
    }
  }
};

const { transactionHash } = await client.execute(
  accounts[0].address,
  'archway1ymhegqt0k9fz4jj4gyv07artlyrdltr2rf9jzqt2czuxvmq9x94sgag3l4',
  mintMsg,
  "auto"
);

console.log(transactionHash);
