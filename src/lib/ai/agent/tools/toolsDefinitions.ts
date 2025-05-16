/* eslint-disable @typescript-eslint/no-unsafe-function-type */
interface SendEmailToolParams {
    to: string;
    subject: string;
    body: string;
}
export async function SendEmailTool({to, subject, body}:SendEmailToolParams) {
    console.log("SendEmailTool", {to, subject, body})
    return {
        success: true,
        message: "Email sent successfully",
        error: null
    }
}

export async function ListUsers({company_id}:{company_id:string}) {
    
    return {
        success: true,
        message: {
            users: ["amine", "oumaima", "suifff"]
        },
        error: null
    }
}

export async function ListCompanies({}) {
    
    return {
        success: true,
        message: {
            companies: [{
                id: "aodk-123",
                name: "Courima"
            }]
        },
        error: null
    }
}

export const tools: Record<string, Function | undefined> ={
    "send_email": SendEmailTool,
    "get_user_list": ListUsers,
    "get_company_list": ListCompanies
}