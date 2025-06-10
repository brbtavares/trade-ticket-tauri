<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { invoke } from "@tauri-apps/api/core";
	import type { OrdemAberta } from "../lib/types"; // Tipagem externa (separada)

	// Inputs da boleta
	let tipoSL = "Desativado";
	let valorSL = 0;

	let tipoTP = "Desativado";
	let valorTP = 0;

	let ativo = "WINM25";
	let quantidade = 1;
	let tipoOrdem = "Mercado";

	// Lista de ordens e logs
	let ordensAbertas: OrdemAberta[] = [];
	let logs: string[] = [];

	const tiposAlvo = [
		"Desativado",
		"R$",
		"% da conta",
		"Pontos",
		"ATR",
		"Bollinger",
	];

	// Envia ordem para backend
	async function enviarOrdem(direcao: "Compra" | "Venda") {
		const ordem = {
			ativo,
			quantidade,
			tipo_ordem: tipoOrdem,
			direcao,
			sl:
				tipoSL === "Desativado"
					? null
					: { tipo: tipoSL, valor: valorSL },
			tp:
				tipoTP === "Desativado"
					? null
					: { tipo: tipoTP, valor: valorTP },
			timestamp: new Date().toISOString(),
		};

		try {
			await invoke("salvar_ordem", { ordem });
			logs = [`[${ordem.timestamp}] Ordem ${direcao} enviada`, ...logs];

			// Adiciona ordem localmente (simulada)
			ordensAbertas = [
				...ordensAbertas,
				{
					id: Date.now(),
					ativo,
					direcao,
					preco: Math.floor(Math.random() * 100000), // Preço simulado
				},
			];
		} catch (e) {
			logs = [`[${new Date().toISOString()}] Erro: ${e}`, ...logs];
		}
	}

	// Encerra manualmente uma ordem
	function fecharOrdem(id: number) {
		ordensAbertas = ordensAbertas.filter((o) => o.id !== id);
		logs = [
			`[${new Date().toISOString()}] Ordem ${id} encerrada manualmente`,
			...logs,
		];
	}

	// Atualiza SL/TP (placeholder, futuro invoke)
	function atualizarSLTP(ordem: OrdemAberta) {
		logs = [
			`[${new Date().toISOString()}] Atualizado SL/TP para ordem ${ordem.id}`,
			...logs,
		];
		// invoke("atualizar_sl_tp", { ordem }) — futura integração
	}

	// Cálculo do lucro ou prejuízo com base no preço atual
	function calcularLucro(ordem: OrdemAberta): number {
		const precoAtual = ordem.precoAtual ?? ordem.preco;
		const fator = ordem.direcao === "Compra" ? 1 : -1;
		return (precoAtual - ordem.preco) * quantidade * fator;
	}

	// Simula atualização do preço atual a cada 1 segundo
	onMount(() => {
		const interval = setInterval(() => {
			ordensAbertas = ordensAbertas.map((ordem) => ({
				...ordem,
				precoAtual: ordem.preco + (Math.random() - 0.5) * 100,
			}));
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<main class="p-4 max-w-md mx-auto space-y-4">
	<h1 class="text-xl font-bold">Boleta Tauri</h1>

	<!-- Formulário principal -->
	<div>
		<label for="ativo-input">Ativo</label>
		<input
			id="ativo-input"
			bind:value={ativo}
			class="w-full border px-2 py-1 mb-2"
		/>
	</div>

	<div>
		<label for="quantidade-input">Quantidade</label>
		<input
			type="number"
			id="quantidade-input"
			bind:value={quantidade}
			class="w-full border px-2 py-1 mb-2"
		/>
	</div>

	<div>
		<label for="tipo-ordem-select">Tipo de Ordem</label>
		<select
			id="tipo-ordem-select"
			bind:value={tipoOrdem}
			class="w-full border px-2 py-1 mb-2"
		>
			<option>Mercado</option>
			<option>Limitada</option>
		</select>
	</div>

	<div>
		<label for="tipo-sl-select">Stop Loss</label>
		<select
			id="tipo-sl-select"
			bind:value={tipoSL}
			class="w-full border px-2 py-1 mb-1"
		>
			{#each tiposAlvo as tipo}
				<option>{tipo}</option>
			{/each}
		</select>
		{#if tipoSL !== "Desativado"}
			<label for="valor-sl-input" class="sr-only">Valor SL</label>
			<input
				type="number"
				id="valor-sl-input"
				bind:value={valorSL}
				placeholder="Valor SL"
				class="w-full border px-2 py-1"
			/>
		{/if}
	</div>

	<div>
		<label for="tipo-tp-select">Take Profit</label>
		<select
			id="tipo-tp-select"
			bind:value={tipoTP}
			class="w-full border px-2 py-1 mb-1"
		>
			{#each tiposAlvo as tipo}
				<option>{tipo}</option>
			{/each}
		</select>
		{#if tipoTP !== "Desativado"}
			<label for="valor-tp-input" class="sr-only">Valor TP</label>
			<input
				type="number"
				id="valor-tp-input"
				bind:value={valorTP}
				placeholder="Valor TP"
				class="w-full border px-2 py-1"
			/>
		{/if}
	</div>

	<!-- Botões -->
	<div class="flex justify-between">
		<button
			on:click={() => enviarOrdem("Compra")}
			class="bg-green-500 text-white px-4 py-2 rounded">Comprar</button
		>
		<button
			on:click={() => enviarOrdem("Venda")}
			class="bg-red-500 text-white px-4 py-2 rounded">Vender</button
		>
	</div>

	<!-- Lista de ordens abertas -->
	<div class="mt-4">
		<h2 class="h5 mb-3">Ordens Abertas</h2>
		{#if ordensAbertas.length === 0}
			<p class="text-muted">Nenhuma ordem aberta no momento.</p>
		{:else}
			{#each ordensAbertas as ordem (ordem.id)}
				<div class="card mb-2">
					<div class="card-body">
						<div
							class="d-flex justify-content-between align-items-center mb-2"
						>
							<span
								>{ordem.direcao}
								{ordem.ativo} @ {ordem.preco}</span
							>
							<button
								on:click={() => fecharOrdem(ordem.id)}
								class="btn btn-sm btn-outline-danger"
							>
								Fechar
							</button>
						</div>

						<div class="row g-2 mb-2">
							<div class="col">
								<input
									type="number"
									placeholder="Novo SL"
									bind:value={ordem.sl}
									class="form-control form-control-sm"
								/>
							</div>
							<div class="col">
								<input
									type="number"
									placeholder="Novo TP"
									bind:value={ordem.tp}
									class="form-control form-control-sm"
								/>
							</div>
						</div>

						<button
							on:click={() => atualizarSLTP(ordem)}
							class="btn btn-sm btn-link p-0 mb-2"
						>
							Atualizar SL/TP
						</button>

						<div
							class={`text-sm ${
								calcularLucro(ordem) > 0
									? "text-success"
									: calcularLucro(ordem) < 0
										? "text-danger"
										: "text-muted"
							}`}
						>
							Lucro: R$ {calcularLucro(ordem).toFixed(2)}
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<div class="mt-4">
		<h2 class="h5 mb-3">Histórico de Ordens</h2>
		<ul
			class="list-group list-group-flush"
			style="max-height: 200px; overflow-y: auto;"
		>
			{#each logs as log}
				<li
					class="list-group-item list-group-item-light py-1 px-2 text-sm"
				>
					{log}
				</li>
			{/each}
		</ul>
	</div>
</main>
