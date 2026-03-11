"use client"

export default function EndpointCardDetails({ params }: { params: { id: string } }) {
    return (
        <div>
            <h1>Endpoint Card Details</h1>
            <p>Card ID: {params.id}</p>
        </div>
    )
}  
