// 密码验证配置
const PASSWORDS = [];
const AVAILABLE_MODELS = require('./config/AvailableModels.json');

export default {
    async fetch(request, env) {
        const originalHost = request.headers.get("host");

        // CORS Headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: corsHeaders
            });
        }

        try {
            const url = new URL(request.url);
            const path = url.pathname;

            // 处理API请求
            if (request.method === 'POST') {
                // 保持原有的POST请求处理逻辑不变
                const data = await request.json();

                // 密码验证
                if (PASSWORDS.length > 0 && (!data.password || !PASSWORDS.includes(data.password))) {
                    return new Response(JSON.stringify({error: 'Please enter the correct password'}), {
                        status: 403,
                        headers: {...corsHeaders, 'Content-Type': 'application/json'}
                    });
                }

                if ('prompt' in data && 'model' in data) {
                    const selectedModel = AVAILABLE_MODELS.find(m => m.id === data.model);
                    if (!selectedModel) {
                        return new Response(JSON.stringify({error: 'Model is invalid'}), {
                            status: 400,
                            headers: {...corsHeaders, 'Content-Type': 'application/json'}
                        });
                    }

                    const model = selectedModel.key;
                    let inputs = {};

                    // 输入参数处理
                    if (data.model === 'flux-1-schnell') {
                        let steps = data.num_steps || 6;
                        if (steps >= 8) steps = 8;
                        else if (steps <= 4) steps = 4;

                        inputs = {
                            prompt: data.prompt || 'cyberpunk cat',
                            steps: steps
                        };
                    } else {
                        inputs = {
                            prompt: data.prompt || 'cyberpunk cat',
                            negative_prompt: data.negative_prompt || '',
                            height: data.height || 1024,
                            width: data.width || 1024,
                            num_steps: data.num_steps || 20,
                            strength: data.strength || 0.1,
                            guidance: data.guidance || 7.5,
                            seed: data.seed || parseInt((Math.random() * 1024 * 1024).toString(), 10),
                        };
                    }

                    console.log(`Generating image with ${model} and prompt: ${inputs.prompt.substring(0, 50)}...`);

                    try {
                        const response = await env.AI.run(model, inputs);

                        // 处理flux-1-schnell模型的响应
                        if (data.model === 'flux-1-schnell') {
                            let jsonResponse;

                            if (typeof response === 'object') {
                                jsonResponse = response;
                            } else {
                                try {
                                    jsonResponse = JSON.parse(response);
                                } catch (e) {
                                    console.error('Failed to parse JSON response:', e);
                                    return new Response(JSON.stringify({
                                        error: 'Failed to parse response',
                                        details: e.message
                                    }), {
                                        status: 500,
                                        headers: {...corsHeaders, 'Content-Type': 'application/json'}
                                    });
                                }
                            }

                            if (!jsonResponse.image) {
                                return new Response(JSON.stringify({
                                    error: 'Invalid response format',
                                    details: 'Image data not found in response'
                                }), {
                                    status: 500,
                                    headers: {...corsHeaders, 'Content-Type': 'application/json'}
                                });
                            }

                            try {
                                // 转换base64为二进制数据
                                const binaryString = atob(jsonResponse.image);
                                const bytes = new Uint8Array(binaryString.length);
                                for (let i = 0; i < binaryString.length; i++) {
                                    bytes[i] = binaryString.charCodeAt(i);
                                }

                                // 返回PNG格式的二进制数据
                                return new Response(bytes, {
                                    headers: {
                                        ...corsHeaders,
                                        'content-type': 'image/png',
                                    },
                                });
                            } catch (e) {
                                console.error('Failed to convert base64 to binary:', e);
                                return new Response(JSON.stringify({
                                    error: 'Failed to process image data',
                                    details: e.message
                                }), {
                                    status: 500,
                                    headers: {...corsHeaders, 'Content-Type': 'application/json'}
                                });
                            }
                        } else {
                            // 直接返回响应
                            return new Response(response, {
                                headers: {
                                    ...corsHeaders,
                                    'content-type': 'image/png',
                                },
                            });
                        }
                    } catch (aiError) {
                        console.error('AI generation error:', aiError);
                        return new Response(JSON.stringify({
                            error: 'Image generation failed',
                            details: aiError.message
                        }), {
                            status: 500,
                            headers: {...corsHeaders, 'Content-Type': 'application/json'}
                        });
                    }
                } else {
                    return new Response(JSON.stringify({error: 'Missing required parameter: prompt or model'}), {
                        status: 400,
                        headers: {...corsHeaders, 'Content-Type': 'application/json'}
                    });
                }
            }else if (request.method === 'GET'){
                const assetResponse = await env.ASSETS.fetch(request);
                return new HTMLRewriter().transform(assetResponse);
            } else {
                new Response("Page Not Found",{status: 404});
            }
        } catch (error) {
            console.error('Worker error:', error);
            return new Response(JSON.stringify({error: 'Internal server error', details: error.message}), {
                status: 500,
                headers: {...corsHeaders, 'Content-Type': 'application/json'}
            });
        }
    }
    ,
}
;
