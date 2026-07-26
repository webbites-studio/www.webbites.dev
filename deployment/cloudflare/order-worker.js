export default {
    async fetch(request, env) {
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

        try {
            const data = await request.json();

            // --- TURNSTILE VERIFICATION ---
            const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `secret=${env.TURNSTILE_SECRET_KEY}&response=${data.turnstileToken}`
            });

            const verification = await verifyResponse.json();
            if (!verification.success) {
                return new Response(JSON.stringify({ error: "CAPTCHA verification failed" }), {
                    status: 403,
                    headers: corsHeaders
                });
            }
            // ------------------------------

            // If verification passed, send to Discord
            await fetch(env.DISCORD_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: `🔔 **New Message from ${data.name}**\nContact: ${data.contact}\nProject Type: ${data.projectType}\nMessage: ${data.message}`
                }),
            });

            return new Response(JSON.stringify({ status: "sent" }), { headers: corsHeaders });

        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
        }
    },
};