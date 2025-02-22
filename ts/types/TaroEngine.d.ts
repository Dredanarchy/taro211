declare class TaroEngine extends TaroClass {
	profiler: any;
	newIdHex(): any;
	tiled: any;
	regionManager: any;
	showRegionList: any;
	unitBeingDragged: any;
	map: any;
	scaleMap(data: any): void;

	fps(): number;
	_renderFrames: number;
	_renderFPS: number;
	_tickStart: number;

	_currentTime: number;
	_cullCounter: number;

	env: string;

	isClient: boolean;
	isServer: boolean;

	isMobile: boolean;

	client: Client;
	server: Client;

	network: TaroNetIoComponent;

	input: TaroInputComponent;

	mobileControls: MobileControlsComponent;

	gameLoopTickHasExecuted: boolean;

	game: GameComponent;

	renderer: PhaserRenderer;

	developerMode: DeveloperMode;

	scaleMapDetails: {
		scaleFactor: {
			x: number;
			y: number;
		};
		shouldScaleTilesheet: boolean;
		tileWidth: number;
		tileHeight: number;
		originalTileHeight: number;
		originalTileWidth: number;
	};

	entitiesToRender: EntitiesToRender;
	triggersQueued: any[];

	constructor(options: object);

	createFrontBuffer(autoSize: boolean, dontScale?: boolean): void
	engineStep(currentTime: number, ctx: number): void;

	physics: {
		_box2dDebug: any;
		staticsFromMap(walls: any): unknown;
		destroyWalls(): unknown;
		world(): any;
		enableDebug(flags: number): void;
		disableDebug(): void;
		_scaleRatioToBox2dWeb: number;
		engine: 'BOX2DWASM' | 'BOX2DWEB' | 'PLANCK';
		box2D?: typeof Box2D & EmscriptenModule
		_scaleRatio: number;
	};

	$(item: number | string | object): any;
	$$(item: number | string | object): any;

	menuUi: MenuUiComponent;
}
