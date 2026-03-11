"use client"

import { FormEvent } from "react";

export type EndpointFormValues = {
    method: string;
    endpointUrl: string;
    headers: string;
    body: string;
    expectedResponseStatus: string;
    timeout: string;
    frequency: string;
};

export default function EndpointCard({ onSubmit }: { onSubmit: (values: EndpointFormValues) => void }) {
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        onSubmit({
            method: String(formData.get("method") ?? "GET"),
            endpointUrl: String(formData.get("endpoint-url") ?? ""),
            headers: String(formData.get("headers") ?? ""),
            body: String(formData.get("body") ?? ""),
            expectedResponseStatus: String(formData.get("expected-response-status") ?? ""),
            timeout: String(formData.get("timeout") ?? ""),
            frequency: String(formData.get("frequency") ?? ""),
        });

        event.currentTarget.reset();
    }

    return(
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" >
                <div className="flex-col gap-4">
                <label htmlFor="method-type">Method Type:</label>
                <select id="method-type" name="method" defaultValue="GET">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                </select>
                <label htmlFor="endpoint-url">Endpoint URL:</label>
                <input type="text" id="endpoint-url" name="endpoint-url" />
                <label htmlFor="headers">Headers:</label>
                <input type="text" id="headers" name="headers" />
                <label htmlFor="body">Body:</label>
                <input type="text" id="body" name="body" />
                <label htmlFor="expected-response-status">Expected Response Status:</label>
                <input type="text" id="expected-response-status" name="expected-response-status" />
                <label htmlFor="timeout">Timeout (ms):</label>
                <input type="text" id="timeout" name="timeout" />
                <label htmlFor="frequency">Frequency (ms):</label>
                <input type="text" id="frequency" name="frequency" />
                <button type="submit">Add Endpoint</button>
                </div>
            </form>
        </div>
    )
}