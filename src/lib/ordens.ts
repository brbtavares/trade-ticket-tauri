import { invoke } from "@tauri-apps/api/core";
import type { Ordem, OrdemAberta } from "./types";

export async function enviarOrdemBase(
	ordem: Ordem,
	logs: string[],
	ordensAbertas: OrdemAberta[]
): Promise<{ logs: string[]; ordensAbertas: OrdemAberta[] }> {
	try {
		await invoke("salvar_ordem", { ordem });

		const novaOrdemAberta: OrdemAberta = {
			id: Date.now(),
			ativo: ordem.ativo,
			direcao: ordem.direcao,
			preco: Math.floor(Math.random() * 100000), // simulado
			precoAtual: Math.floor(Math.random() * 100000), // novo campo
		};

		return {
			logs: [
				`[${ordem.timestamp}] Ordem ${ordem.direcao} enviada`,
				...logs,
			],
			ordensAbertas: [...ordensAbertas, novaOrdemAberta],
		};
	} catch (e) {
		return {
			logs: [`[${new Date().toISOString()}] Erro: ${e}`, ...logs],
			ordensAbertas,
		};
	}
}

export function fecharOrdem(
	id: number,
	ordens: OrdemAberta[],
	logs: string[]
): { logs: string[]; ordens: OrdemAberta[] } {
	return {
		logs: [
			`[${new Date().toISOString()}] Ordem ${id} encerrada manualmente`,
			...logs,
		],
		ordens: ordens.filter((o) => o.id !== id),
	};
}
