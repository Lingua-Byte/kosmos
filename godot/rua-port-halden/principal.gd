extends Node2D
# KOSMOS — exemplo no Godot: uma rua de Port Halden à noite.
# Setas (ou A/D) andam; clicar ou tocar num ponto da rua também anda até lá.
# Perto do viaduto, E (ou um toque no muro) faz olhar o que está riscado.
# Tudo é desenhado por código, sem arte: é só para ver como o Godot funciona.

const LARGURA := 2600.0
const CHAO := 560.0
const VELOCIDADE := 260.0
const MURO_X := 2150.0

const C_TEXTO := Color("#ece6d8")
const C_SUAVE := Color("#a9a4b8")
const C_OURO := Color("#e8c77a")
const C_TINTA := Color(0.78, 0.93, 0.86)

# Os textos que aparecem ao olhar o muro, um pedaço por vez, digitados.
const PAGINAS := [
	"Alguém riscou isto no concreto do viaduto. A tinta ainda escorre.",
	"∮(t)",
	"Palavra nova no Diário:  ∮(t) = laço.",
]

var fonte: Font
var jogador_x := 300.0
var alvo_x := -1.0
var andando := 0.0
var virado := 1.0
var tempo := 0.0

var predios_perto := []
var predios_longe := []
var gotas := []

var camera: Camera2D
var relogio: Label
var lugar: Label
var aviso: Label
var caixa: PanelContainer
var texto: Label
var seguir: Label
var lendo := false
var pagina := 0
var letras := 0.0


func _ready() -> void:
	fonte = load("res://fontes/DejaVuSans.ttf")
	var rng := RandomNumberGenerator.new()
	rng.seed = 2147  # sempre a mesma cidade
	var x := -200.0
	while x < LARGURA + 400.0:
		var w := rng.randf_range(110, 220)
		var h := rng.randf_range(140, 300)
		predios_longe.append({"r": Rect2(x, CHAO - 60 - h - 120, w, h + 120), "seed": rng.randi()})
		x += w + rng.randf_range(4, 30)
	x = -100.0
	while x < MURO_X - 350.0:
		var w := rng.randf_range(160, 280)
		var h := rng.randf_range(180, 360)
		predios_perto.append({"r": Rect2(x, CHAO - 40 - h, w, h), "seed": rng.randi()})
		x += w + rng.randf_range(30, 80)
	for i in 140:
		gotas.append(Vector2(rng.randf_range(0, 1400), rng.randf_range(0, 760)))

	camera = Camera2D.new()
	camera.limit_left = 0
	camera.limit_right = int(LARGURA)
	camera.limit_top = 0
	camera.limit_bottom = 720
	camera.position_smoothing_enabled = true
	add_child(camera)
	camera.make_current()
	_montar_hud()


func _montar_hud() -> void:
	var hud := CanvasLayer.new()
	add_child(hud)
	var tela := Control.new()
	tela.set_anchors_preset(Control.PRESET_FULL_RECT)
	tela.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud.add_child(tela)

	lugar = _rotulo(tela, "PORT HALDEN", 16, C_SUAVE)
	lugar.position = Vector2(28, 22)
	relogio = _rotulo(tela, "21:47", 22, C_OURO)
	_prender(relogio, 1.0, 0.0, Vector2(-100, 18))

	aviso = _rotulo(tela, "E  ·  olhar o muro", 18, C_TEXTO)
	_prender(aviso, 0.5, 1.0, Vector2(-80, -64))
	aviso.visible = false

	caixa = PanelContainer.new()
	var estilo := StyleBoxFlat.new()
	estilo.bg_color = Color(0.03, 0.045, 0.1, 0.92)
	estilo.border_color = Color(C_OURO, 0.35)
	estilo.set_border_width_all(1)
	estilo.set_corner_radius_all(12)
	estilo.set_content_margin_all(24)
	caixa.add_theme_stylebox_override("panel", estilo)
	caixa.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	caixa.custom_minimum_size = Vector2(760, 150)
	caixa.position = Vector2(-380, -190)
	caixa.visible = false
	tela.add_child(caixa)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 14)
	caixa.add_child(col)
	texto = Label.new()
	texto.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	texto.custom_minimum_size = Vector2(700, 60)
	texto.add_theme_font_override("font", fonte)
	texto.add_theme_font_size_override("font_size", 24)
	texto.add_theme_color_override("font_color", C_TEXTO)
	col.add_child(texto)
	seguir = Label.new()
	seguir.text = "Continuar ▸"
	seguir.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	seguir.add_theme_font_override("font", fonte)
	seguir.add_theme_font_size_override("font_size", 18)
	seguir.add_theme_color_override("font_color", C_OURO)
	col.add_child(seguir)


func _rotulo(pai: Control, t: String, tam: int, cor: Color) -> Label:
	var l := Label.new()
	l.text = t
	l.add_theme_font_override("font", fonte)
	l.add_theme_font_size_override("font_size", tam)
	l.add_theme_color_override("font_color", cor)
	pai.add_child(l)
	return l


# prende um rótulo num ponto da tela (0 a 1 em x e y), com um deslocamento em pixels
func _prender(c: Control, ax: float, ay: float, desvio: Vector2) -> void:
	c.anchor_left = ax
	c.anchor_right = ax
	c.anchor_top = ay
	c.anchor_bottom = ay
	c.offset_left = desvio.x
	c.offset_top = desvio.y


func _perto_do_muro() -> bool:
	return absf(jogador_x - MURO_X) < 140.0


func _process(delta: float) -> void:
	tempo += delta
	# o relógio pisca, mas não sai das 21:47
	relogio.text = "21:47" if fmod(tempo, 1.0) < 0.6 else "21 47"

	if lendo:
		var cheio: String = PAGINAS[pagina]
		letras = minf(letras + delta * 38.0, cheio.length())
		texto.text = cheio.substr(0, int(letras))
		seguir.visible = int(letras) >= cheio.length()
		texto.add_theme_font_size_override("font_size", 64 if cheio == "∮(t)" else 24)
		texto.add_theme_color_override("font_color", C_TINTA if cheio == "∮(t)" else C_TEXTO)
		andando = 0.0
	else:
		var dir := 0.0
		if Input.is_key_pressed(KEY_LEFT) or Input.is_key_pressed(KEY_A):
			dir -= 1.0
		if Input.is_key_pressed(KEY_RIGHT) or Input.is_key_pressed(KEY_D):
			dir += 1.0
		if dir != 0.0:
			alvo_x = -1.0
		elif alvo_x >= 0.0:
			if absf(alvo_x - jogador_x) < 6.0:
				alvo_x = -1.0
			else:
				dir = signf(alvo_x - jogador_x)
		jogador_x = clampf(jogador_x + dir * VELOCIDADE * delta, 40.0, LARGURA - 40.0)
		andando = absf(dir)
		if dir != 0.0:
			virado = dir

	lugar.text = "PORT HALDEN  ·  VIADUTO LESTE" if jogador_x > MURO_X - 600.0 else "PORT HALDEN"
	aviso.visible = _perto_do_muro() and not lendo
	camera.position = Vector2(jogador_x, 360)

	for i in gotas.size():
		var g: Vector2 = gotas[i]
		g += Vector2(-120, 900) * delta
		if g.y > 760:
			g = Vector2(randf_range(0, 1500), -20)
		gotas[i] = g
	queue_redraw()


func _unhandled_input(ev: InputEvent) -> void:
	var apertou: bool = ev is InputEventKey and ev.pressed and not ev.echo and (ev.keycode == KEY_E or ev.keycode == KEY_ENTER or ev.keycode == KEY_SPACE)
	var tocou: bool = ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT
	if lendo and (apertou or tocou):
		_avancar()
		return
	if apertou and _perto_do_muro():
		_abrir_muro()
	elif tocou:
		var ponto := get_global_mouse_position()
		if _perto_do_muro() and absf(ponto.x - MURO_X) < 90.0:
			_abrir_muro()
		else:
			alvo_x = clampf(ponto.x, 40.0, LARGURA - 40.0)


func _abrir_muro() -> void:
	lendo = true
	pagina = 0
	letras = 0.0
	caixa.visible = true


func _avancar() -> void:
	var cheio: String = PAGINAS[pagina]
	if int(letras) < cheio.length():
		letras = cheio.length()  # primeiro toque completa o texto
		return
	pagina += 1
	letras = 0.0
	if pagina >= PAGINAS.size():
		lendo = false
		caixa.visible = false


# ---------- desenho da rua ----------
func _draw() -> void:
	var cx := camera.get_screen_center_position().x if camera else jogador_x
	var esq := cx - 700.0
	# céu
	draw_rect(Rect2(esq, 0, 1400, CHAO), Color(0.02, 0.03, 0.08))
	draw_rect(Rect2(esq, 260, 1400, CHAO - 260), Color(0.05, 0.05, 0.1, 0.6))
	# prédios ao longe (andam mais devagar: profundidade)
	for p in predios_longe:
		var r: Rect2 = p.r
		r.position.x += cx * 0.45
		draw_rect(r, Color(0.045, 0.055, 0.1))
	# prédios da rua
	for p in predios_perto:
		_predio(p.r, p.seed)
	# viaduto
	draw_rect(Rect2(MURO_X - 420, 180, LARGURA, 70), Color(0.2, 0.2, 0.23))
	draw_rect(Rect2(MURO_X - 420, 250, LARGURA, 8), Color(0.1, 0.1, 0.12))
	for px in [MURO_X - 300.0, MURO_X, MURO_X + 300.0]:
		draw_rect(Rect2(px - 80, 258, 160, CHAO - 258), Color(0.24, 0.24, 0.26))
		draw_rect(Rect2(px - 80, 258, 14, CHAO - 258), Color(0.18, 0.18, 0.2))
	# riscos no pilar (os de sempre) e o ∮(t)
	var marcas := [[-60, 300, -20, 340], [-30, 470, 40, 455], [10, 310, 60, 300], [-55, 500, -10, 530]]
	for m in marcas:
		draw_line(Vector2(MURO_X + m[0], m[1]), Vector2(MURO_X + m[2], m[3]), Color(0.5, 0.55, 0.6, 0.5), 3.0)
	var brilho := 0.75 + 0.25 * sin(tempo * 2.0) if _perto_do_muro() else 0.8
	draw_string(fonte, Vector2(MURO_X - 56, 420), "∮(t)", HORIZONTAL_ALIGNMENT_LEFT, -1, 54, Color(C_TINTA, brilho))
	# chão: calçada e rua molhada
	draw_rect(Rect2(esq, CHAO, 1400, 30), Color(0.13, 0.13, 0.15))
	draw_rect(Rect2(esq, CHAO + 30, 1400, 200), Color(0.05, 0.055, 0.07))
	# postes
	var p0 := floorf(esq / 420.0) * 420.0
	var px2 := p0
	while px2 < esq + 1500.0:
		_poste(px2 + 160.0)
		px2 += 420.0
	# a pessoa
	_pessoa(jogador_x)
	# chuva (presa à tela)
	for g in gotas:
		var a: Vector2 = g + Vector2(esq, 0)
		draw_line(a, a + Vector2(-4, 18), Color(0.6, 0.7, 0.85, 0.25), 1.0)


func _predio(r: Rect2, semente: int) -> void:
	draw_rect(r, Color(0.07, 0.075, 0.11))
	var rng := RandomNumberGenerator.new()
	rng.seed = semente
	var y := r.position.y + 20.0
	while y < r.end.y - 30.0:
		var x := r.position.x + 16.0
		while x < r.end.x - 26.0:
			if rng.randf() < 0.28:
				var cor := Color(0.95, 0.78, 0.45, 0.75) if rng.randf() < 0.8 else Color(0.55, 0.75, 1.0, 0.6)
				draw_rect(Rect2(x, y, 14, 18), cor)
			x += 28.0
		y += 34.0


func _poste(x: float) -> void:
	draw_rect(Rect2(x - 3, CHAO - 210, 6, 210), Color(0.12, 0.12, 0.14))
	draw_rect(Rect2(x - 3, CHAO - 210, 40, 5), Color(0.12, 0.12, 0.14))
	for i in 5:
		draw_circle(Vector2(x + 34, CHAO - 200), 80.0 - i * 15.0, Color(1.0, 0.8, 0.45, 0.03 + i * 0.015))
	draw_circle(Vector2(x + 34, CHAO - 202), 5.0, Color(1.0, 0.9, 0.7))
	# reflexo na rua molhada
	draw_rect(Rect2(x + 26, CHAO + 34, 16, 110), Color(1.0, 0.8, 0.45, 0.14))


func _pessoa(x: float) -> void:
	var passo := sin(tempo * 9.0) * 9.0 * andando
	var casaco := Color(0.28, 0.24, 0.2)
	draw_line(Vector2(x - 5, CHAO - 26), Vector2(x - 5 + passo, CHAO), Color(0.1, 0.1, 0.12), 6.0)
	draw_line(Vector2(x + 5, CHAO - 26), Vector2(x + 5 - passo, CHAO), Color(0.1, 0.1, 0.12), 6.0)
	draw_rect(Rect2(x - 13, CHAO - 74, 26, 50), casaco)
	draw_line(Vector2(x + 10 * virado, CHAO - 66), Vector2(x + 12 * virado - passo * 0.5, CHAO - 34), casaco.darkened(0.2), 6.0)
	draw_circle(Vector2(x, CHAO - 86), 11.0, Color(0.78, 0.66, 0.56))
	draw_rect(Rect2(x - 12, CHAO - 98, 24, 6), Color(0.15, 0.13, 0.12))
