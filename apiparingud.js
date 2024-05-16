// Credit goes to Simon Plenderleith.  https://simonplend.com/how-to-use-fetch-to-post-form-data-as-json-to-your-api/


async function postFormDataAsJson({url, formData}) {
    /**
     * We can't pass the `FormData` instance directly to `fetch`
     * as that will cause it to automatically format the request
     * body as "multipart" and set the `Content-Type` request header
     * to `multipart/form-data`. We want to send the request body
     * as JSON, so we're converting it to a plain object and then
     * into a JSON string.
     */
    const plainFormData = Object.fromEntries(formData.entries());
    const formDataJsonString = JSON.stringify(plainFormData);

    const fetchOptions = {
        // The default method for a request with fetch is GET, so we must tell it to use the POST HTTP method.
        method: "POST",
        /**
         * These headers will be added to the request and tell
         * the API that the request body is JSON and that we can
         * accept JSON responses.
         */
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        // The body of our POST request is the JSON string that we created above.
        body: formDataJsonString,
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }

    return response.json();
}

async function getDataAsJson(url) {

    const fetchOptions = {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    };
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
    return response.json();
}


async function deleteObject(url) {
        const response = await fetch(url, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }
        listiraamatud();
}

function handleResponse(form, responseData) {
    const resultElement = document.getElementById("tulemus");

    if (form.id === "frontform") {
        resultElement.innerHTML = responseData.tulemus;
        listiraamatud();
    } else if (form.id === "otsinguform") {
        let output = "Sõne '" + responseData.sone + "' leiti järgmistest raamatutest: <br/>";
        for (var tulemus of responseData.tulemused) {
            output += "Raamat " + tulemus.raamatu_id + " - " + tulemus.leitud + " korda!<br/>";
        }
        resultElement.innerHTML = output;
    }
}


async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const url = form.action;

    try {
        const formData = new FormData(form);
        const responseData = await postFormDataAsJson({url, formData});

        console.log({responseData});
        handleResponse(form, responseData);
    } catch (error) {
        console.error(error);
    }
}

async function listiraamatud() {
    try {
        const responseData = await getDataAsJson("https://hsraamatudapiudras.azurewebsites.net/raamatud/");

        const resultElement = document.getElementById("raamatud_result");
        resultElement.innerHTML = "";

        for (var raamat of responseData.raamatud) {
            const displayFilename = raamat.replace('.txt', '');
            resultElement.innerHTML += '<a href="https://hsraamatudapiudras.azurewebsites.net/raamatud/' + displayFilename + '" download="' + raamat + '" >' + displayFilename + "</a> " +
                '<a href="#" onclick="deleteObject(\'https://hsraamatudapiudras.azurewebsites.net/raamatud/' + displayFilename + '\')" > [kustuta]</a>' +
                "<br />";
        }
    } catch (error) {
        console.error("Error loading books:", error);
    }
}
