
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
} from "https://deno.land/x/handyhelpers@5.1.97/mod.js"


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

// Shader sources
let s_vertex_shader_source = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

let s_fragment_shader_source = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
    }
`;

let f_o_uniform_shared_cpu_gpu_variable = function(
    s_name, 
    v_last_frame, 
    v_current_frame
){
    return {
        s_name,
        v_last_frame, 
        v_current_frame
    }
}
let o_uniform_shared_cpu_gpu_variable__n_ms_time = 
    f_o_uniform_shared_cpu_gpu_variable('n_ms_time');
let o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_left = 
    f_o_uniform_shared_cpu_gpu_variable('n_b_mouse_down_left');
let o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_middle = 
    f_o_uniform_shared_cpu_gpu_variable('n_b_mouse_down_middle');
let o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_right = 
    f_o_uniform_shared_cpu_gpu_variable('n_b_mouse_down_right');
let o_uniform_shared_cpu_gpu_variable__o_trn_mouse_nor = 
    f_o_uniform_shared_cpu_gpu_variable('o_trn_mouse_nor');
let o_uniform_shared_cpu_gpu_variable__o_scl_texture1 = 
    f_o_uniform_shared_cpu_gpu_variable('o_scl_texture1');
let o_uniform_shared_cpu_gpu_variable__o_texture1 = 
    f_o_uniform_shared_cpu_gpu_variable('o_texture1');
let a_o_uniform_shared_cpu_gpu_variable = [
    o_uniform_shared_cpu_gpu_variable__n_ms_time,
    o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_left,
    o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_middle,
    o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_right,
    o_uniform_shared_cpu_gpu_variable__o_trn_mouse_nor,
    o_uniform_shared_cpu_gpu_variable__o_scl_texture1,
    o_uniform_shared_cpu_gpu_variable__o_texture1,
]
let o_shader_program_display_shader = {
    a_o_uniform_shared_cpu_gpu_variable: [
        o_uniform_shared_cpu_gpu_variable__n_ms_time,
        o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_left,
        o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_middle,
        o_uniform_shared_cpu_gpu_variable__n_b_mouse_down_right,
        o_uniform_shared_cpu_gpu_variable__o_trn_mouse_nor,
        o_uniform_shared_cpu_gpu_variable__o_scl_texture1,
        o_uniform_shared_cpu_gpu_variable__o_texture1,
    ],
    s_fragment_shader_source: `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform float n_ms_time;
    uniform sampler2D o_texture1;
    uniform vec2 o_scl_canvas;
    uniform vec2 o_scl_texture1;
    uniform float n_b_mouse_down_left;
    uniform float n_b_mouse_down_middle;
    uniform float n_b_mouse_down_right;
    uniform vec2 o_trn_mouse_nor;
    uniform float n_b_invert;
    uniform float n_b_mirror_vertical;
    uniform float n_b_mirror_horizontal;
    uniform float n_b_mirror_diagonal;
    
    void main() {
        vec2 texelSize = 1.0 / o_scl_texture1;
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
        color = texture2D(o_texture1, modifiedTexCoord  * texelSize);
    
        // Simple box filter for downsampling
        // for (int x = -1; x <= 1; x++) {
        //     for (int y = -1; y <= 1; y++) {
        //         color += texture2D(o_texture1, modifiedTexCoord + vec2(x, y) * texelSize);
        //     }
        // }
    
        // vec4 o_col = color / 9.0;
        vec4 o_col = color;
    
        if (n_b_invert == 1.0) {
            o_col.rgb = 1.0 - o_col.rgb; // Invert colors
        }
        float n = length(modifiedTexCoord/3);
    
        gl_FragColor = vec4(n, 0.,0.,1.); // Output the final color
    }
    `, 
    s_vertex_shader_source: `
    attribute vec4 a_position;
    varying vec2 v_texCoord;

    void main() {
        gl_Position = a_position;
        v_texCoord = a_position.xy * 0.5 + 0.5;
    }
    `,
    o_scl: [1000,1000],
    o_info_vertex: null, 
    o_info_fragment: null, 
    o_program_shader: null,
}

let a_o_shader_program = [
    o_shader_program_display_shader,
]

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

        o_scl_canvas: [0,0], 
        n_b_mouse_down_left: false,
        n_b_mouse_down_middle: false,
        n_b_mouse_down_right: false,
        o_trn_mouse_nor: [0,0], 
        o_scl_texture1: [0,0], 
        o_texture1: [0,0],
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
                    f_a_o:async ()=> [
                        {
                            innerText: "name is: staticaddedperson"
                        },
                    ],
                    a_s_prop_sync: 'a_s_name',
                },
            
            ]
        }
    }, 
    o_state
)
document.body.appendChild(o)
document.body.appendChild(o_canvas);

let f_pass_cpu_data_to_gpu = function(o_shader_program){
    for(let o_uniform_shared_cpu_gpu_variable of o_shader_program.a_o_uniform_shared_cpu_gpu_variable){
        if(o_uniform_shared_cpu_gpu_variable.v_current_frame != o_uniform_shared_cpu_gpu_variable.v_last_frame){
            let v_new = o_uniform_shared_cpu_gpu_variable.v_current_frame;
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

let f_render_pass = function(){

    // console.log('asdf')
    for(let o_uniform_shared_cpu_gpu_variable of a_o_uniform_shared_cpu_gpu_variable){
        let v = o_state[o_uniform_shared_cpu_gpu_variable.s_name];
        if(v){
            o_uniform_shared_cpu_gpu_variable.v_current_frame = v;
        }
    }

    // // switch the shader program
    let o_shader_program = o_shader_program_display_shader
    o_gl.useProgram(o_shader_program.o_program);

    // Vertex data for a full-screen quad
    let a_n_vertex = [
        -1.0, -1.0,
        1.0, -1.0,
        -1.0,  1.0,
        1.0,  1.0
    ];

    f_pass_cpu_data_to_gpu(o_shader_program);
    // Create buffer
    let o_buffer = o_gl.createBuffer();
    o_gl.bindBuffer(o_gl.ARRAY_BUFFER, o_buffer);
    o_gl.bufferData(o_gl.ARRAY_BUFFER, new Float32Array(a_n_vertex), o_gl.STATIC_DRAW);

    // Bind vertex attribute
    let n_loc__position = o_gl.getAttribLocation(o_shader_program.o_program, 'a_position');
    o_gl.enableVertexAttribArray(n_loc__position);
    o_gl.vertexAttribPointer(n_loc__position, 2, o_gl.FLOAT, false, 0, 0);

    // Set viewport size to 3x3 pixels
    o_canvas.width = o_shader_program.o_scl[0];
    o_canvas.height = o_shader_program.o_scl[1];
    o_state.o_scl_canvas[0] = o_shader_program.o_scl[0];
    o_state.o_scl_canvas[1] = o_shader_program.o_scl[1];
    o_gl.viewport(0, 0, o_canvas.width, o_canvas.height);

    // Clear the canvas
    o_gl.clearColor(0.0, 0.0, 0.0, 1.0);
    o_gl.clear(o_gl.COLOR_BUFFER_BIT);

    // Draw the quad
    o_gl.drawArrays(o_gl.TRIANGLE_STRIP, 0, 4);
    //



    for(let o_uniform_shared_cpu_gpu_variable of a_o_uniform_shared_cpu_gpu_variable){
        let v = o_state[o_uniform_shared_cpu_gpu_variable.s_name];
        if(v){
            o_uniform_shared_cpu_gpu_variable.v_last_frame = o_uniform_shared_cpu_gpu_variable.v_current_frame;
        }
    }
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

