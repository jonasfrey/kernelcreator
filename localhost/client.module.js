
import {
    f_add_css,
    f_s_css_prefixed,
    o_variables, 
    f_s_css_from_o_variables
} from "https://deno.land/x/f_add_css@2.0.0/mod.js"

import {
    f_o_html_from_o_js,
    f_o_proxified_and_add_listeners, 
    f_o_shader_info_and_compile_shader
} from "https://deno.land/x/handyhelpers@5.2.3/mod.js"


o_variables.n_rem_font_size_base = 1. // adjust font size, other variables can also be adapted before adding the css to the dom
o_variables.n_rem_padding_interactive_elements = 0.5; // adjust padding for interactive elements 
f_add_css(
    `
    body{
        min-height: 100vh;
        min-width: 100vw;
        /* background: rgba(0,0,0,0.84);*/
        display:flex;
        justify-content:center;
        align-items:flex-start;
    }
    canvas{
        image-rendering: pixelated;
        width: 100%;
        height: 100%;
        position:fixed;
        z-index:-1;
    }
    #o_el_time{
        margin:1rem;
        background: rgba(0, 0, 0, 0.4);
        padding: 1rem;
    }
    ${
        f_s_css_from_o_variables(
            o_variables
        )
    }
    `
);


let f_callback_beforevaluechange = function(a_s_path, v_old, v_new){

}
let f_callback_aftervaluechange = function(a_s_path, v_old, v_new){

}
//webglstuff
// f_o_shader_info_and_compile_shader


// WebGL context
let o_canvas = document.createElement('canvas');
let o_gl = o_canvas.getContext('webgl');

let a_o_uniform_shared_cpu_gpu_variable = []
let a_o_shader_program = []

let f_o_uniform_shared_cpu_gpu_variable = function(
    s_name, 
    s_glsl_initialization_prefix,
    v_last_render_pass, 
    v_current_render_pass
){

    let o = {
        s_name,
        s_glsl_initialization_prefix,
        v_last_render_pass, 
        v_current_render_pass
    }
    a_o_uniform_shared_cpu_gpu_variable.push(o);
    return o
}
let o_uniform_shared_cpu_gpu_variable__n_ms_time = 
    f_o_uniform_shared_cpu_gpu_variable('n_ms_time', 'uniform float');
let o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_left = 
    f_o_uniform_shared_cpu_gpu_variable('n_b_mouse_down_left', 'uniform float');
let o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_middle = 
    f_o_uniform_shared_cpu_gpu_variable('n_b_mouse_down_middle', 'uniform float');
let o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_right = 
    f_o_uniform_shared_cpu_gpu_variable('n_b_mouse_down_right', 'uniform float');
let o_uniform_shared_cpu_gpu_variable__n_b_invert = 
    f_o_uniform_shared_cpu_gpu_variable('n_b_invert', 'uniform float')
let o_uniform_shared_cpu_gpu_variable__n_b_mirror_vertical = 
    f_o_uniform_shared_cpu_gpu_variable('n_b_mirror_vertical', 'uniform float')
let o_uniform_shared_cpu_gpu_variable__n_b_mirror_horizontal = 
    f_o_uniform_shared_cpu_gpu_variable('n_b_mirror_horizontal', 'uniform float')
let o_uniform_shared_cpu_gpu_variable__n_b_mirror_diagonal = 
    f_o_uniform_shared_cpu_gpu_variable('n_b_mirror_diagonal', 'uniform float')

let o_uniform_shared_cpu_gpu_variable__o_trn_mouse_nor = 
    f_o_uniform_shared_cpu_gpu_variable('o_trn_mouse_nor', 'uniform vec2');
let o_uniform_shared_cpu_gpu_variable__o_scl_texture0 = 
    f_o_uniform_shared_cpu_gpu_variable('o_scl_texture0', 'uniform vec2');
let o_uniform_shared_cpu_gpu_variable__o_texture0 = 
    f_o_uniform_shared_cpu_gpu_variable('o_texture0', 'uniform sampler2D');


function f_insert_before(str, search, insert) {
    const index = str.indexOf(search);
    if (index === -1) return str; // Not found, return original
    return str.slice(0, index) + insert + str.slice(index);
}

let f_o_shader_program = function(
    a_o_uniform_shared_cpu_gpu_variable, 
    s_fragment_shader_source, 
    s_vertex_shader_source
){
    let o = {
        a_o_uniform_shared_cpu_gpu_variable, 
        s_fragment_shader_source:
        f_insert_before(
            s_fragment_shader_source, 
            'void main()',
            '\n'+a_o_uniform_shared_cpu_gpu_variable.map(
                o=>{
                    return `${o.s_glsl_initialization_prefix} ${o.s_name};`
                }
            ).join('\n')
        ), 
        s_vertex_shader_source, 
        o_info_vertex: null,
        o_info_fragment: null,
        o_program_shader: null,
    }
    a_o_shader_program.push(o);
    return o
}

let o_shader_program_circle_animation_simple = f_o_shader_program(
    [o_uniform_shared_cpu_gpu_variable__n_ms_time], 
    `
    precision mediump float;
    varying vec2 v_texCoord;
    void main() {

        float n = length((v_texCoord/vec2(3.)));
    
        gl_FragColor = vec4(
            sin(n*33.+n_ms_time*0.1+0.2),
            sin(n*33.+n_ms_time*0.1+0.4),
            sin(n*33.+n_ms_time*0.1+0.6),
            1.
        ); // Output the final color
        gl_FragColor = vec4(1.,0.,0.,1.);
    }
    `,
    `
    attribute vec4 a_position;
    varying vec2 v_texCoord;

    void main() {
        gl_Position = a_position;
        v_texCoord = a_position.xy * 0.5 + 0.5;
    }
    `
)

let o_shader_program_display_shader = f_o_shader_program(
    [
        o_uniform_shared_cpu_gpu_variable__n_ms_time,
        o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_left,
        o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_middle,
        o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_right,
        o_uniform_shared_cpu_gpu_variable__o_trn_mouse_nor,
        o_uniform_shared_cpu_gpu_variable__o_scl_texture0,
        o_uniform_shared_cpu_gpu_variable__o_texture0,
        o_uniform_shared_cpu_gpu_variable__n_b_invert,
        o_uniform_shared_cpu_gpu_variable__n_b_mirror_vertical,
        o_uniform_shared_cpu_gpu_variable__n_b_mirror_horizontal,
        o_uniform_shared_cpu_gpu_variable__n_b_mirror_diagonal
    ],
    `
    precision mediump float;
    varying vec2 v_texCoord;
    
    void main() {
        vec2 texelSize = vec2(1.0) / o_scl_texture0.xy;
        vec2 modifiedTexCoord = v_texCoord;
    
        // Apply reflection/mirroring based on the boolean flags
        if (n_b_mirror_vertical == 1.0) {
            // Reflect on y-axis (vertical symmetry)
            modifiedTexCoord.x = abs(modifiedTexCoord.x - 0.5) * 2.0;
        }
        if (n_b_mirror_horizontal == 1.0) {
            // Reflect on x-axis (horizontal symmetry)
            modifiedTexCoord.y = abs(modifiedTexCoord.y - 0.5) * 2.0;
        }
        if (n_b_mirror_diagonal == 1.0) {
            // Mirror on diagonal axis (swap and reflect)
            modifiedTexCoord.xy = abs(modifiedTexCoord.yx - 0.5) * 2.0;
        }
        vec4 color = vec4(0.0);
        color = texture2D(o_texture0, modifiedTexCoord  * texelSize);
    
        // Simple box filter for downsampling
        // for (int x = -1; x <= 1; x++) {
        //     for (int y = -1; y <= 1; y++) {
        //         color += texture2D(o_texture0, modifiedTexCoord + vec2(x, y) * texelSize);
        //     }
        // }
    
        // vec4 o_col = color / 9.0;
        vec4 o_col = color;
    
        if (n_b_invert == 1.0) {
            o_col.rgb = 1.0 - o_col.rgb; // Invert colors
        }
    
        gl_FragColor = vec4(o_col.r, o_col.g,o_col.b, 1.); // Output the final color
    }
    `, 
    `
    attribute vec4 a_position;
    varying vec2 v_texCoord;

    void main() {
        gl_Position = a_position;
        v_texCoord = a_position.xy * 0.5 + 0.5;
    }
    `,
)



let f_compile_and_potentially_throw_error = function(s_type, s_source, o_gl, o_shader_program){
    o_shader_program[`o_info_${s_type}`] = f_o_shader_info_and_compile_shader(
        s_type, 
        s_source, 
        o_gl
    );
    if(o_shader_program?.o_info_vertex?.a_o_shader_error?.length > 0){
        for(let o_shader_error of o_shader_program?.o_info_vertex?.a_o_shader_error){
            console.error(o_shader_error.s_rustlike_error)
        }
        // throw new Error("shader could not compile, has errors!");
    }
}

for(let o_shader_program of a_o_shader_program){
    f_compile_and_potentially_throw_error('vertex',o_shader_program.s_vertex_shader_source, o_gl,o_shader_program);
    f_compile_and_potentially_throw_error('fragment',o_shader_program.s_fragment_shader_source, o_gl,o_shader_program);

    o_shader_program.o_program = o_gl.createProgram();
    o_gl.attachShader(o_shader_program.o_program, o_shader_program?.o_info_fragment?.o_shader);
    o_gl.attachShader(o_shader_program.o_program, o_shader_program?.o_info_vertex?.o_shader);
    o_gl.linkProgram(o_shader_program.o_program);

    if (!o_gl.getProgramParameter(o_shader_program.o_program, o_gl.LINK_STATUS)) {
        console.error('Shader program linking error:', o_gl.getProgramInfoLog(o_shader_program.o_program));
    }
}



let o_div = document;
let o_state = f_o_proxified_and_add_listeners(
    {
        n_fps: 60,
        n_id_raf: 0,
        n_ms_last: 0,
        n_ms_sum: 0,
        n_ms_count: 0,

        o_test: {s:'test'},
        s_test: "asdf",
        o_scl_canvas: [200,200], 
        n_b_mouse_down_left: false,
        n_b_mouse_down_middle: false,
        n_b_mouse_down_right: false,
        o_trn_mouse_nor: [0,0], 
        o_scl_texture0: [0,0], 
        o_texture0: [0,0],
        n_ms_time: 0
    },
    f_callback_beforevaluechange,
    f_callback_aftervaluechange, 
    o_div
)
// we dont put webgl stuff into the o_state
let o_gpu_programs = {

}

globalThis.o_state = o_state

// let f_sleep_ms = async function(n_ms){
//     return new Promise((f_res, f_rej)=>{
//         setTimeout(()=>{
//             return f_res(true)
//         },n_ms)
//     })
// }
// then we build the html 
let o = await f_o_html_from_o_js(
    {
        class: "test",
        f_a_o: ()=>{
            return [
                {
                    s_tag: "input",
                    a_s_prop_sync: 'o_scl_canvas.0'
                },
                {
                    s_tag: "input",
                    a_s_prop_sync: 'o_scl_canvas.1'
                },
            
            ]
        }
    }, 
    o_state
)
document.body.appendChild(o)
document.body.appendChild(o_canvas);
console.log(a_o_shader_program)
let f_pass_cpu_data_to_gpu = function(o_shader_program){
    for(let o_uniform_shared_cpu_gpu_variable of o_shader_program.a_o_uniform_shared_cpu_gpu_variable){
        if(o_uniform_shared_cpu_gpu_variable.v_current_render_pass != o_uniform_shared_cpu_gpu_variable.v_last_render_pass){
            let v_new = o_uniform_shared_cpu_gpu_variable.v_current_render_pass;
            debugger
            if (typeof v_new === 'number') {
                o_gl.uniform1f( 
                    o_gl.getUniformLocation(
                        o_shader_program.o_program, 
                        o_uniform_shared_cpu_gpu_variable.s_name
                    ),
                    v_new
                );
            }
            if (v_new?.length == 2) {
                o_gl.uniform2f( 
                    o_gl.getUniformLocation(
                        o_shader_program.o_program, 
                        o_uniform_shared_cpu_gpu_variable.s_name
                    ),
                    v_new[0],v_new[1] 
                );
            }
            if (v_new?.length == 3) {
                o_gl.uniform3f( 
                    o_gl.getUniformLocation(
                        o_shader_program.o_program, 
                        o_uniform_shared_cpu_gpu_variable.s_name
                    ),
                    v_new[0],v_new[1],v_new[2]
                );
            }
            if (v_new?.length == 4) {
                o_gl.uniform4f( 
                    o_gl.getUniformLocation(
                        o_shader_program.o_program, 
                        o_uniform_shared_cpu_gpu_variable.s_name
                    ),
                    v_new[0],v_new[1],v_new[2],v_new[3]
                );
            }
        }
    }
}
// function setupFramebuffer(o_ctx, o_framebuffer, o_texture, width, height) {
//     o_ctx.bindTexture(o_ctx.TEXTURE_2D, o_texture);
//     o_ctx.texImage2D(o_ctx.TEXTURE_2D, 0, o_ctx.RGBA, width, height, 0, o_ctx.RGBA, o_ctx.UNSIGNED_BYTE, null);
//     o_ctx.texParameteri(o_ctx.TEXTURE_2D, o_ctx.TEXTURE_MIN_FILTER, o_ctx.LINEAR);
//     o_ctx.texParameteri(o_ctx.TEXTURE_2D, o_ctx.TEXTURE_MAG_FILTER, o_ctx.LINEAR);

//     o_ctx.bindFramebuffer(o_ctx.FRAMEBUFFER, o_framebuffer);
//     o_ctx.framebufferTexture2D(o_ctx.FRAMEBUFFER, o_ctx.COLOR_ATTACHMENT0, o_ctx.TEXTURE_2D, o_texture, 0);
// }

let f_resize_framebuffer_with_texture = function(
    o_gl, 
    o_framebuffer,
    o_texture, 
    n_scl_x, 
    n_scl_y
) {
    // Bind the framebuffer
    o_gl.bindFramebuffer(o_gl.FRAMEBUFFER, o_framebuffer);

    // Bind the texture and resize it
    o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture);
    o_gl.texImage2D(
        o_gl.TEXTURE_2D,
        0,
        o_gl.RGBA,
        n_scl_x,
        n_scl_y,
        0,
        o_gl.RGBA,
        o_gl.UNSIGNED_BYTE,
        null
    );

    // Reattach the texture to the framebuffer
    o_gl.framebufferTexture2D(
        o_gl.FRAMEBUFFER,
        o_gl.COLOR_ATTACHMENT0,
        o_gl.TEXTURE_2D,
        o_texture,
        0
    );

    // Check if the framebuffer is complete
    if (o_gl.checkFramebufferStatus(o_gl.FRAMEBUFFER) !== o_gl.FRAMEBUFFER_COMPLETE) {
        console.error('Framebuffer is not complete');
    }

    // Unbind the framebuffer
    o_gl.bindFramebuffer(o_gl.FRAMEBUFFER, null);
}

// Vertex data for a full-screen quad
let a_n_vertex = [
    -1.0, -1.0,
    1.0, -1.0,
    -1.0,  1.0,
    1.0,  1.0
];
// Create buffer
let o_buffer = o_gl.createBuffer();
o_gl.bindBuffer(o_gl.ARRAY_BUFFER, o_buffer);
o_gl.bufferData(o_gl.ARRAY_BUFFER, new Float32Array(a_n_vertex), o_gl.STATIC_DRAW);

let o_framebuffer_main1 = o_gl.createFramebuffer();
let o_framebuffer_main2 = o_gl.createFramebuffer();
let o_texture_main1 = o_gl.createTexture();
let o_texture_main2 = o_gl.createTexture();
let o_texture_current = o_texture_main1;
let o_texture_previous = o_texture_main2;
f_resize_framebuffer_with_texture(
    o_gl, 
    o_framebuffer_main1, 
    o_texture_main1, 
    1000,
    1000
);
f_resize_framebuffer_with_texture(
    o_gl, 
    o_framebuffer_main2, 
    o_texture_main2, 
    1000,
    1000
);
let o_shader_program = null;
let n_loc__position = null;
let f_render_pass = function(){

    // console.log('asdf')
    for(let o_uniform_shared_cpu_gpu_variable of a_o_uniform_shared_cpu_gpu_variable){
        let v = o_state[o_uniform_shared_cpu_gpu_variable.s_name];
        if(v){
            o_uniform_shared_cpu_gpu_variable.v_current_render_pass = v;
        }
    }

    if(o_texture_current == o_texture_main1){
        o_gl.bindFramebuffer(o_gl.FRAMEBUFFER, o_framebuffer_main1);
    }else{
        o_gl.bindFramebuffer(o_gl.FRAMEBUFFER, o_framebuffer_main2);
    }
    

    o_shader_program = o_shader_program_circle_animation_simple;
    o_gl.useProgram(o_shader_program.o_program);
    f_pass_cpu_data_to_gpu(o_shader_program);
    // Bind vertex attribute
    n_loc__position = o_gl.getAttribLocation(o_shader_program.o_program, 'a_position');
    o_gl.enableVertexAttribArray(
        n_loc__position
    );
    o_gl.vertexAttribPointer(n_loc__position, 2, o_gl.FLOAT, false, 0, 0);
    // Set viewport size to 3x3 pixels
    o_canvas.width = o_state.o_scl_canvas[0];
    o_canvas.height = o_state.o_scl_canvas[1];
    o_gl.viewport(0, 0, o_canvas.width, o_canvas.height);
    // Clear the canvas
    o_gl.clearColor(0.0, 0.0, 0.0, 1.0);
    o_gl.clear(o_gl.COLOR_BUFFER_BIT);
    // Draw the quad
    o_gl.drawArrays(o_gl.TRIANGLE_STRIP, 0, 4);
    



    // // switch the shader program to the display shader
    o_shader_program = o_shader_program_display_shader
    o_gl.useProgram(o_shader_program.o_program);
    f_pass_cpu_data_to_gpu(o_shader_program);
    let n_idx_texture = 0;
    o_gl.activeTexture(o_gl.TEXTURE0);
    o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture_previous);
    o_gl.uniform1i(o_gl.getUniformLocation(o_shader_program.o_program, 'o_texture0'), n_idx_texture);
    
    // Bind vertex attribute
    n_loc__position = o_gl.getAttribLocation(o_shader_program.o_program, 'a_position');
    o_gl.enableVertexAttribArray(
        n_loc__position
    );
    o_gl.vertexAttribPointer(n_loc__position, 2, o_gl.FLOAT, false, 0, 0);
    // Set viewport size to 3x3 pixels
    o_canvas.width = o_state.o_scl_canvas[0];
    o_canvas.height = o_state.o_scl_canvas[1];
    o_gl.viewport(0, 0, o_canvas.width, o_canvas.height);
    //render to canvas !
    // Unbind the framebuffer (render to the default framebuffer, which is the canvas)
    o_gl.bindFramebuffer(o_gl.FRAMEBUFFER, null);
    // Clear the canvas
    o_gl.clearColor(0.0, 0.0, 0.0, 1.0);
    o_gl.clear(o_gl.COLOR_BUFFER_BIT);

    // Draw the quad
    o_gl.drawArrays(o_gl.TRIANGLE_STRIP, 0, 4);
    


    for(let o_uniform_shared_cpu_gpu_variable of a_o_uniform_shared_cpu_gpu_variable){
        let v = o_state[o_uniform_shared_cpu_gpu_variable.s_name];
        if(v){
            o_uniform_shared_cpu_gpu_variable.v_last_render_pass = o_uniform_shared_cpu_gpu_variable.v_current_render_pass;
        }
    }

    // // Swap textures for the next frame
    let o_tmp = o_texture_previous; 
    o_texture_previous = o_texture_current;
    o_texture_current = o_tmp; 

}


let f_raf = function(n_ms){


    // ------------- performance measuring: start
    let n_ms_delta = n_ms-o_state.n_ms_last;
    o_state.n_ms_sum = parseFloat(o_state.n_ms_sum) + parseFloat(n_ms_delta);
    o_state.n_ms_count+=1;
    if(o_state.n_ms_sum > 1000){
        // console.log(`n_fps ${1000/(o_state.n_ms_sum/o_state.n_ms_count)}`)
        o_state.n_ms_sum= 0;
        o_state.n_ms_count= 0;
    }

    // ------------- performance measuring: end


    // console.log(globalThis.performance.now())
    if(n_ms_delta > (1000/o_state.n_fps)){
        o_state.n_ms_time = globalThis.performance.now();
        f_render_pass();
        o_state.n_ms_last = n_ms

    }

    o_state.n_id_raf = requestAnimationFrame(f_raf)

}



let f_start_animation = function(){
    o_state.n_id_raf = requestAnimationFrame(f_raf)
}
let f_stop_animation = function(){
    o_state.n_id_raf = cancelAnimationFrame(o_state.n_id_raf)
}

f_start_animation();

window.onmousedown = function(
    o_e
){
    let s_button = ['left', 'middle', 'right'][o_e.button];
    o_state[`n_b_mouse_down_${s_button}`] = 1
}
window.onmouseup = function(
    o_e
){
    o_state[`n_b_mouse_down_left`] = 0
    o_state[`n_b_mouse_down_middle`] = 0
    o_state[`n_b_mouse_down_right`] = 0
}
window.onmousemove = function(o_e){
    o_state.o_trn_mouse_nor = [
        o_e.clientX/window.innerWidth,
        o_e.clientY/window.innerHeight
    ];
}

