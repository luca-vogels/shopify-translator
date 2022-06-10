import fetch from "node-fetch";

export function translate(fromLocale: string = "auto", toLocale: string, text: string, callback: (err: any | null, text: string | null) => void): void {
    const now = new Date().getTime();

    fetch("https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "origin": "https://www.deepl.com",
            "referer": "https://www.deepl.com"
        },
        body: JSON.stringify({
            id: 82710003,
            jsonrpc: "2.0",
            method: "LMT_handle_jobs",
            params: {
                commonJobParams: {
                    browserType: 1
                },
                jobs: [{
                    kind: "default",
                    preferred_num_beams: 1, // how many different responses
                    raw_en_context_after: [],
                    raw_en_context_before: [],
                    sentences: [{
                        text: text,
                        prefix: ""
                    }]
                }],
                lang: {
                    source_lang_user_selected: fromLocale.toUpperCase(),
                    target_lang: toLocale.toUpperCase()
                },
                timestamp: now
            }
        })
    }).then((response: any) => response.json()).then((json: any) => {
        console.log("JSON: ");
        console.log(json);
        callback(null, json.result.translations.beams[0].sentences[0].text);
    }).catch((err: any) => {
        callback(err, null);
    });

    /*
    const http = new XMLHttpRequest();
    http.addEventListener("loadend", function(){
        try {
            const json = JSON.parse(http.responseText);

            console.log("DeepL Response: "); // TODO REMOVE
            console.log(json); // TODO REMOVE

            callback(null, json.result.translations.beams[0].sentences[0].text);
        } catch (ex){ callback(ex, null); }
    });
    http.open("POST", "https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs");
    http.setRequestHeader("content-type", "application/json");
    http.setRequestHeader("origin", "https://www.deepl.com");
    http.setRequestHeader("referer", "https://www.deepl.com");
    http.send(JSON.stringify({
        id: Math.floor(now / 100000),
        jsonrpc: "2.0",
        method: "LMT_handle_jobs",
        params: {
            commonJobParams: {
                browserType: 1
            },
            jobs: [{
                kind: "default",
                preferred_num_beams: 1, // how many different responses
                raw_en_context_after: [],
                raw_en_context_before: [],
                sentences: [{
                    text: text,
                    prefix: ""
                }]
            }],
            lang: {
                source_lang_user_selected: fromLocale.toUpperCase(),
                target_lang: toLocale.toUpperCase()
            },
            timestamp: now
        }
    }));*/
}


export default {
    translate
}