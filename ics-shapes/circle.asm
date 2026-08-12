; circle.asm
; ICS assignment: menu-driven shape generator (circle).
; Target: x86 32-bit Linux, NASM syntax, raw int 0x80 syscalls (no libc).
;
; Build:  nasm -f elf32 circle.asm -o circle.o && ld -m elf_i386 circle.o -o circle
;
; Flow: print menu -> read a choice -> validate -> draw. The circle radius is
; picked randomly (6-12) from /dev/urandom, with a time+pid fallback.

section .data
     title db "                 Shapes Menu", 10
     titleLen equ $ - title
     separator db "=============================================", 10
     separatorLen equ $ - separator
     square db "1. Square"
     squareLen equ $ - square
     circle db "                            2. Circle", 10
     circleLen equ $ - circle
     rectangle db "3. Rectangle"
     rectangleLen equ $ - rectangle
     triangle db "                         4. Triangle",10
     triangleLen equ $ - triangle
     diamond db "5. Diamond", 10
     diamondLen equ $ - diamond
     question db "Enter the number of the shape you want: "
     questionLen equ $ - question
     answerLine db "Your answer is: "
     answerLineLen equ $ - answerLine
    ansSquare db "Square",10
    ansSquareLen equ $ - ansSquare
    ansCircle db "Circle",10
    ansCircleLen equ $ - ansCircle
    ansRectangle db "Rectangle",10
    ansRectangleLen equ $ - ansRectangle
    ansTriangle db "Triangle",10
    ansTriangleLen equ $ - ansTriangle
    ansDiamond db "Diamond",10
    ansDiamondLen equ $ - ansDiamond
    ansInvalid db "Invalid choice! Please select 1-5.",10
    ansInvalidLen equ $ - ansInvalid
    eofMsg db "No input available - exiting.",10
    eofMsgLen equ $ - eofMsg

    urandom_path db "/dev/urandom",0

section .bss
     answer resb 64
     seed        resd 1
     radius      resd 1
     row         resd 1
     col         resd 1
     line_buf    resb 256

section .text
    global _start
_start:
call init_seed

mov eax,4
mov ebx,1
mov ecx,title
mov edx,titleLen
int 0x80
mov eax,4
mov ebx,1
mov ecx,separator
mov edx,separatorLen
int 0x80
mov eax,4
mov ebx,1
mov ecx,square
mov edx,squareLen
int 0x80
mov eax,4
mov ebx,1
mov ecx,circle
mov edx,circleLen
int 0x80
mov eax,4
mov ebx,1
mov ecx,rectangle
mov edx,rectangleLen
int 0x80
mov eax,4
mov ebx,1
mov ecx,triangle
mov edx,triangleLen
int 0x80
mov eax,4
mov ebx,1
mov ecx,diamond
mov edx,diamondLen
int 0x80
jmp ask_question

ask_question:
mov eax,4
mov ebx,1
mov ecx,question
mov edx,questionLen
int 0x80

; read one whole line; EAX = -1 means stdin hit EOF with nothing left to read
call read_line
cmp eax, -1
je eof_exit

; a valid answer is exactly one character long
cmp eax, 1
jne case_invalid

; "Your answer is: " is printed only once the choice is known to be valid
cmp byte [answer], '1'
je case_square
cmp byte [answer], '2'
je case_circle
cmp byte [answer], '3'
je case_rectangle
cmp byte [answer], '4'
je case_triangle
cmp byte [answer], '5'
je case_diamond
jmp case_invalid

case_square:
call print_answer_line
mov eax,4
mov ebx,1
mov ecx,ansSquare
mov edx,ansSquareLen
int 0x80
jmp exit_program
case_circle:
call print_answer_line
mov eax,4
mov ebx,1
mov ecx,ansCircle
mov edx,ansCircleLen
int 0x80
call get_random_radius
mov [radius], eax
call draw_circle
jmp exit_program
case_rectangle:
call print_answer_line
mov eax,4
mov ebx,1
mov ecx,ansRectangle
mov edx,ansRectangleLen
int 0x80
jmp exit_program
case_triangle:
call print_answer_line
mov eax,4
mov ebx,1
mov ecx,ansTriangle
mov edx,ansTriangleLen
int 0x80
jmp exit_program
case_diamond:
call print_answer_line
mov eax,4
mov ebx,1
mov ecx,ansDiamond
mov edx,ansDiamondLen
int 0x80
jmp exit_program
case_invalid:
mov eax,4
mov ebx,1
mov ecx,ansInvalid
mov edx,ansInvalidLen
int 0x80
jmp ask_question

eof_exit:
mov eax,4
mov ebx,1
mov ecx,eofMsg
mov edx,eofMsgLen
int 0x80
mov eax, 1
mov ebx, 1
int 0x80

exit_program:
mov eax, 1
mov ebx, 0
int 0x80


print_answer_line:
    push eax
    push ebx
    push ecx
    push edx
    mov eax,4
    mov ebx,1
    mov ecx,answerLine
    mov edx,answerLineLen
    int 0x80
    pop edx
    pop ecx
    pop ebx
    pop eax
    ret


; ---------------------------------------------------------------
; read_line -> EAX = characters stored in `answer`, or -1 if stdin
; was already at EOF.
;
; Reads ONE byte at a time and stops at '\n'. A single 64-byte
; sys_read is wrong here: on a pipe the kernel may hand back several
; lines at once, so a re-prompt after an invalid entry would re-read
; the SAME stale buffer forever. Byte-at-a-time consumes exactly one
; line per call, and the EOF return is what stops the retry loop from
; spinning when input runs out.
;
; Trailing CR / space / tab are trimmed so CRLF files and stray
; spaces still validate.
; ---------------------------------------------------------------
read_line:
    push ebx
    push ecx
    push edx
    push edi

    xor edi, edi                  ; edi = characters stored
.rl_loop:
    cmp edi, 63
    jge .rl_done
    mov eax, 3                    ; sys_read
    mov ebx, 0                    ; stdin
    lea ecx, [answer + edi]
    mov edx, 1
    int 0x80
    cmp eax, 0
    jle .rl_eof                   ; 0 = EOF, negative = error
    mov cl, [answer + edi]
    cmp cl, 10                    ; newline ends the line
    je .rl_done
    inc edi
    jmp .rl_loop

.rl_eof:
    cmp edi, 0
    je .rl_no_input               ; nothing at all was read
    jmp .rl_done

.rl_no_input:
    mov eax, -1
    jmp .rl_ret

.rl_done:
    ; trim trailing CR, space and tab
.rl_trim:
    cmp edi, 0
    je .rl_terminate
    mov cl, [answer + edi - 1]
    cmp cl, 13
    je .rl_chop
    cmp cl, ' '
    je .rl_chop
    cmp cl, 9
    je .rl_chop
    jmp .rl_terminate
.rl_chop:
    dec edi
    jmp .rl_trim

.rl_terminate:
    mov byte [answer + edi], 0
    mov eax, edi

.rl_ret:
    pop edi
    pop edx
    pop ecx
    pop ebx
    ret


; ---------------------------------------------------------------
; init_seed: seeds the LCG from /dev/urandom. Falls back to
; time ^ (pid << 16) if the device cannot be opened, so two runs
; inside the same second still differ (plain sys_time alone repeats
; the radius for every run within one second).
; ---------------------------------------------------------------
init_seed:
    mov eax, 5                    ; sys_open
    mov ebx, urandom_path
    xor ecx, ecx                  ; O_RDONLY
    xor edx, edx
    int 0x80
    cmp eax, 0
    jl .fallback

    mov ebx, eax                  ; fd
    mov eax, 3                    ; sys_read
    mov ecx, seed
    mov edx, 4
    int 0x80
    push eax
    mov eax, 6                    ; sys_close (ebx still holds fd)
    int 0x80
    pop eax
    cmp eax, 4
    je .done

.fallback:
    mov eax, 13                   ; sys_time(NULL)
    xor ebx, ebx
    int 0x80
    mov [seed], eax
    mov eax, 20                   ; sys_getpid
    int 0x80
    shl eax, 16
    xor [seed], eax
.done:
    ret


; ---------------------------------------------------------------
; get_random_radius -> EAX = radius in 6..12
; ---------------------------------------------------------------
get_random_radius:
    mov     eax, [seed]
    mov     ebx, 1103515245
    imul    ebx
    add     eax, 12345
    mov     [seed], eax

    shr     eax, 16
    and     eax, 0x7FFF
    xor     edx, edx
    mov     ebx, 7
    div     ebx
    add     edx, 6
    mov     eax, edx
    ret


; ---------------------------------------------------------------
; draw_circle: filled disc built one row at a time into line_buf.
;
; A cell is inside when  dx^2 + 4*dy^2 <= (2r)^2 + 2r,  where
; dx = col - 2r and dy = row - r. Columns are scaled 2x because a
; terminal cell is about twice as tall as it is wide.
;
; The "+ 2r" is what makes it look round: with a plain (2r)^2 the
; top and bottom rows satisfy the test at dx = 0 ONLY, so the disc
; came out with a single-character spike sticking out of each pole.
; Adding 2r widens the test by half a cell and gives a flat cap.
; ---------------------------------------------------------------
draw_circle:
    mov     dword [row], 0

.row_loop:
    mov     eax, [radius]
    imul    eax, 2
    cmp     dword [row], eax
    jg      .row_done

    mov     dword [col], 0
    xor     edi, edi

.col_loop:
    mov     eax, [radius]
    imul    eax, 4
    cmp     dword [col], eax
    jg      .col_done

    mov     eax, [col]
    mov     ebx, [radius]
    imul    ebx, 2
    sub     eax, ebx
    mov     esi, eax                ; esi = dx

    mov     eax, [row]
    sub     eax, [radius]
    mov     edx, eax                ; edx = dy

    mov     eax, esi
    imul    eax, esi                ; dx^2
    push    eax

    mov     eax, edx
    imul    eax, edx                ; dy^2
    imul    eax, eax, 4             ; 4*dy^2

    pop     ebx
    add     eax, ebx                ; dx^2 + 4*dy^2

    mov     ebx, [radius]
    add     ebx, ebx                ; 2r
    mov     ecx, ebx                ; keep 2r
    imul    ebx, ebx                ; (2r)^2
    add     ebx, ecx                ; (2r)^2 + 2r

    cmp     eax, ebx
    jg      .print_space
    mov     byte [line_buf + edi], '*'
    jmp     .col_next
.print_space:
    mov     byte [line_buf + edi], ' '
.col_next:
    inc     edi
    inc     dword [col]
    jmp     .col_loop

.col_done:
    mov     byte [line_buf + edi], 10
    inc     edi
    mov     eax, 4
    mov     ebx, 1
    mov     ecx, line_buf
    mov     edx, edi
    int     0x80

    inc     dword [row]
    jmp     .row_loop

.row_done:
    ret
