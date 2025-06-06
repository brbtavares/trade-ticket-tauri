export type TipoSLTP =
	| "Desativado"
	| "R$"
	| "% da conta"
	| "Pontos"
	| "ATR"
	| "Bollinger";

export type Ordem = {
	ativo: string;
	quantidade: number;
	tipo_ordem: string;
	direcao: "Compra" | "Venda";
	sl: null | { tipo: TipoSLTP; valor: number };
	tp: null | { tipo: TipoSLTP; valor: number };
	timestamp: string;
};

export type OrdemAberta = {
	id: number;
	ativo: string;
	direcao: string;
	preco: number;
	sl?: number;
	tp?: number;
	precoAtual?: number; // NOVO
};
