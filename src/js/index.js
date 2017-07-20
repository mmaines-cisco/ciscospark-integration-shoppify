'use-strict';

const button = document.getElementById('btn-connect-disconnect');
const addStoreButton = document.getElementById('btn-add-store');
const connectStoreButton = document.getElementById('btn-connect-store');

const ciscospark_access_token = "MWJhN2Q4N2YtZmNiNS00MDMyLWE1YzAtOTZiMTY4NjY5OGM4ZjQzM2VhNDMtMWMx";


const env = {
    "ciscospark": {
        "oauth2-endpoint": "https://api.ciscospark.com/v1/authorize",
        "client-secret": "b0e8dfac27bf6a374dcaec9ad6a763a6125b82a5f862c098a5e0a0d7ac4c4019",
        "client-id": "Cf14c66a547d565a58a107141a509e8f4d8a7367e7a9cd9966675387841c41ca9",
        "redirect-uri": "http://162.243.24.208",
        "response-type": "code",
        "scope": "spark:rooms_read,spark:messages_write"
    },
    "shopify": {
        "oauth2-endpoint": ".myshopify.com/admin/oauth/authorize",
        "client-id": "0e9be945d3ad6fff27202c714f4c6b1d",
        "shop": {
            "name": "useless-book-store",
            "access_token": "",
        },
        "nonce": "",
        "redirect-uri": "http://162.243.24.208",
        "scope": "write_orders,read_customers",
        "devStore": {
            "isDevStore": true,
            "key": "c3f880f44998e17feb8db20f590ec2fd85ac68f16e1fe77ca2476be66df78a73"
        }
    }

};


button.onclick = function() {
    alert("Hello");
};

connectStoreButton.onclick = function() {
    let store_name = document.getElementById('input-store-name').value;
 
    if(store_name == "") {
        alert('please enter a store name');
        return;
    }

    console.log(env.shopify.oath2_endpoint);

    let url = "https://"+store_name+ env.shopify['oauth2-endpoint'] +"?client_id=" + env.shopify['client-id'] + "&scope=" + env.shopify.scope + "&redirect_uri=" + env.shopify['redirect-uri'] + "&state=" + store_name;
    console.log(url);

    window.location.replace(url);
}


let axiosHeaders = {
        headers: {
            'Authorization': "Bearer " + ciscospark_access_token
        }
};

axios.get("https://api.ciscospark.com/v1/rooms", axiosHeaders)
.then(function(response){
    console.log(response);
})
.catch(function(error) {
    console.log(error);
});
