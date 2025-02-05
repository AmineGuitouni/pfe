export async function PSOT(request: Request) {
    console.log(await request.json())
    return new Response('Hello from the API')
}