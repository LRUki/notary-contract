//jshint esversion:8
const Web3 = require('web3');
import notaryArtifact from "../../build/contracts/Notary.json";

var App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const {
      web3
    } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = notaryArtifact.networks[networkId];
      App.d = deployedNetwork;
      this.meta = new web3.eth.Contract(
        notaryArtifact.abi,
        deployedNetwork.address
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

      //this.refreshBalance();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
      console.log(error)
    }
  },

  sendProcess: async function() {
    $("div#statusEnter").text("");
    if ($('#fileWrite')[0].files.length > 0) {
      let file = $('#fileWrite')[0].files[0];
      App.appendStatusEnter("Creating Hash...");
      createHash(file)
        .then(async function(hash) {
          App.appendStatusEnter(" [OK]<br />");

          //normalizing the hash
          if (hash.substring(0, 2) !== '0x') {
            hash = "0x" + hash;
          }

          var fileHash = hash;
          var fileName = file.name;
          var comment = $('#comment')[0].value;

          $('#fileWrite')[0].value = "";

          App.appendStatusEnter("Sending Transaction ... (This process might take a while)");
          const {
            addEntry
          } = App.meta.methods;

          try {
            console.log('Entered hash', fileHash);
            console.log('filename', fileName);
            console.log('comment', comment);
            //didnt work for .call() method
            let res = await addEntry(fileHash, fileName, comment).send({
              from: App.account,
              gas: 3000000
            });
            App.appendStatusEnter(" [OK]<br />");
            App.appendStatusEnter("Result-Object in console!<br />");

            let url = 'https://ropsten.etherscan.io/tx/' + res.transactionHash;
            App.appendStatusEnter('Your transaction: ' + '<a>' + url + '</a>');
            $("div#statusEnter a").attr("href", url);
            console.log(res);

          } catch (err) {
            if (err.message.search("revert") >= 0) {
              App.appendStatusEnter('[Cannot enter the same file!]');
              console.log(err);
            } else {
              App.appendStatusEnter('Something went wrong! Please try it again');
            }
          }
        });

    } else {
      console.warn("There was no file selected!");
    }
    return false;
  },

  appendStatusEnter: (text) => {
    $("div#statusEnter").append(text);
  },

  appendStatusCheck: (text) => {
    $("div#statusCheck").append(text);
  },

  readProcess: () => {
    $("div#statusCheck").text("");
    if ($('#fileRead')[0].files.length > 0) {
      var file = $('#fileRead')[0].files[0];
      App.appendStatusCheck("Creating Hash...");
      createHash(file)
        .then(function(hash) {
          App.appendStatusCheck(" [OK]<br />");

          //normalizing the hash
          if (hash.substring(0, 2) !== '0x') {
            hash = "0x" + hash;
          }
          var fileHash = hash;
          $('#fileRead')[0].value = "";
          $("div#status").text("");
          App.appendStatusCheck("Sending Call ... ");

          const {
            entrySet
          } = App.meta.methods;

          return entrySet(fileHash).call().then(res => {
              App.appendStatusCheck(" [OK]<br />");
              App.appendStatusCheck("Result-Object in console!<br>");

              let userHistoryURL = 'https://ropsten.etherscan.io/address/' + res[3];
              App.appendStatusCheck("Check your transaction history here: ");
              console.log(res);
              App.appendStatusCheck('<a class="mb-5 pb-2">' + userHistoryURL + '</a>');
              $('div#statusCheck a').attr('href', userHistoryURL);
              var uploadedOn = new Date(parseInt(res[1]) * 1000);
              $("#resultRead").html("<strong>File Found!</strong><br />" +
                "Original Filename: " + '<p class="result">' + res[0] + '</p>' + "<br />" +
                "File's unique id (hash): " + '<p class="result">' + res[4] + '</p>' + "<br />" +
                "Uploaded on: " + '<p class="result">' + uploadedOn + '</p>' + "<br />" +
                "Uploaded by: " + '<p class="result">' + res[3] + '</p>' + "<br />" +
                "Comment: " + '<p class="result">' + res[2] + '</p>')

              $('strong').css('font-size', '160%').css('color', 'purple')
              $("#resultRead").css('border', '3px dashed purple').css('text-align', 'left').css('margin', '5% 10%').attr('class', 'p-3 mb-3').css('font-size', '110%')
              $("p.result").css('font-family', 'sans-serif').css('font-weight', '700').css('color', 'green').attr('class', 'mb-0').css('font-size', '90%')
            })
            .catch(function(err) {
              $("#resultRead").html("<br /><strong>File not found in Database.</strong>")
              App.appendStatusCheck("ERROR: File not found <br />" + err);
              console.error(err);
            });
        });
    } else {
      console.warn("There was no file selected!");
    }
    return false;
  }

};

window.App = App;

$(document).ready(function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    alert('Please download metamask!');
  }

  App.start();

  $("#enterData").on("click", App.sendProcess);
  $("#checkData").on("click", App.readProcess);

});

function createHash(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() {
      var buffer = this.result;
      crypto.subtle.digest('SHA-256', buffer)
        .then(function(hash) {
          resolve(toHex(hash));
        })
        .catch(reject);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
function toHex(buffer) {
  var i, n, k, value, stringValue, padding, paddedValue;
  var hexCodes = [];
  var view = new DataView(buffer);
  for (i = 0, n = view.byteLength, k = Uint32Array.BYTES_PER_ELEMENT; i < n; i += k) {
    // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
    value = view.getUint32(i);
    // toString(16) will give the hex representation of the number without padding
    stringValue = value.toString(16);
    // We use concatenation and slice for padding
    padding = '00000000';
    paddedValue = (padding + stringValue).slice(-padding.length);
    hexCodes.push(paddedValue);
  }
  // Join all the hex strings into one
  return hexCodes.join('');
}