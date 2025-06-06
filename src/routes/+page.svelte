<script lang="ts">
	import { onMount } from "svelte";
	import { enviarOrdemBase, fecharOrdem } from "$lib/ordens";
	import type { Ordem, OrdemAberta, TipoSLTP } from "$lib/types";

	let tipoSL: TipoSLTP = "Desativado";
	let valorSL = 0;

	let tipoTP: TipoSLTP = "Desativado";
	let valorTP = 0;

	let ativo = "WINM25";
	let quantidade = 1;
	let tipoOrdem = "Mercado";

	let logs: string[] = [];
	let ordensAbertas: OrdemAberta[] = [];

	const tiposAlvo: TipoSLTP[] = [
		"Desativado",
		"R$",
		"% da conta",
		"Pontos",
		"ATR",
		"Bollinger",
	];

	async function enviarOrdem(direcao: "Compra" | "Venda") {
		const ordem: Ordem = {
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

		const resultado = await enviarOrdemBase(ordem, logs, ordensAbertas);
		logs = resultado.logs;
		ordensAbertas = resultado.ordensAbertas;
	}

	function fechar(id: number) {
		const resultado = fecharOrdem(id, ordensAbertas, logs);
		logs = resultado.logs;
		ordensAbertas = resultado.ordens;
	}

	function atualizarSLTP(ordem: OrdemAberta) {
		logs = [
			`[${new Date().toISOString()}] Atualizado SL/TP para ordem ${ordem.id}`,
			...logs,
		];
	}

	function calcularLucro(ordem: OrdemAberta): number {
		const fator = ordem.direcao === "Compra" ? 1 : -1;
		return (
			((ordem.precoAtual ?? ordem.preco) - ordem.preco) *
			quantidade *
			fator
		);
	}

	onMount(() => {
		const intervalo = setInterval(() => {
			ordensAbertas = ordensAbertas.map((ordem) => {
				// Variação simulada de -30 a +30
				const variacao = Math.floor(Math.random() * 61) - 30;
				const novoPreco = (ordem.precoAtual ?? ordem.preco) + variacao;
				return { ...ordem, precoAtual: novoPreco };
			});
		}, 3000); // a cada 3 segundos

		return () => clearInterval(intervalo); // limpa o intervalo ao desmontar
	});
</script>

<main class="p-4 max-w-md mx-auto space-y-4">
	<h1 class="text-xl font-bold">Boleta Tauri</h1>

	<div>
		<label>Ativo</label>
		<input bind:value={ativo} class="w-full border px-2 py-1 mb-2" />
	</div>

	<div>
		<label>Quantidade</label>
		<input
			type="number"
			bind:value={quantidade}
			class="w-full border px-2 py-1 mb-2"
		/>
	</div>

	<div>
		<label>Tipo de Ordem</label>
		<select bind:value={tipoOrdem} class="w-full border px-2 py-1 mb-2">
			<option>Mercado</option>
			<option>Limitada</option>
		</select>
	</div>

	<div>
		<label>Stop Loss</label>
		<select bind:value={tipoSL} class="w-full border px-2 py-1 mb-1">
			{#each tiposAlvo as tipo}
				<option>{tipo}</option>
			{/each}
		</select>
		{#if tipoSL !== "Desativado"}
			<input
				type="number"
				bind:value={valorSL}
				placeholder="Valor SL"
				class="w-full border px-2 py-1"
			/>
		{/if}
	</div>

	<div>
		<label>Take Profit</label>
		<select bind:value={tipoTP} class="w-full border px-2 py-1 mb-1">
			{#each tiposAlvo as tipo}
				<option>{tipo}</option>
			{/each}
		</select>
		{#if tipoTP !== "Desativado"}
			<input
				type="number"
				bind:value={valorTP}
				placeholder="Valor TP"
				class="w-full border px-2 py-1"
			/>
		{/if}
	</div>

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

	<div class="mt-4">
		<h2 class="font-semibold mb-2">Logs</h2>
		<ul class="text-sm bg-gray-100 p-2 rounded h-40 overflow-auto">
			{#each logs as log}
				<li>{log}</li>
			{/each}
		</ul>
	</div>

	<div class="mt-6">
		<h2 class="text-lg font-semibold mb-2">Ordens Abertas</h2>
		{#if ordensAbertas.length === 0}
			<p class="text-sm text-gray-500">
				Nenhuma ordem aberta no momento.
			</p>
		{:else}
			{#each ordensAbertas as ordem (ordem.id)}
				<div class="border p-2 rounded mb-2">
					<div class="flex justify-between">
						<span
							>{ordem.direcao}
							{ordem.ativo} @ {ordem.preco} → {ordem.precoAtual}</span
						>

						<button
							on:click={() => fechar(ordem.id)}
							class="text-red-500 text-xs">Fechar</button
						>
					</div>

					<div class="grid grid-cols-2 gap-2 mt-2">
						<input
							type="number"
							placeholder="Novo SL"
							bind:value={ordem.sl}
							class="w-full border px-1 py-0.5 text-sm"
						/>
						<input
							type="number"
							placeholder="Novo TP"
							bind:value={ordem.tp}
							class="w-full border px-1 py-0.5 text-sm"
						/>
					</div>

					<button
						on:click={() => atualizarSLTP(ordem)}
						class="text-blue-500 text-xs mt-1"
					>
						Atualizar SL/TP
					</button>

					<span
						class="text-sm"
						class:text-green-600={calcularLucro(ordem) > 0}
						class:text-red-600={calcularLucro(ordem) < 0}
						class:text-gray-600={calcularLucro(ordem) === 0}
					>
						Lucro: {calcularLucro(ordem)}
					</span>
				</div>
			{/each}
		{/if}
	</div>
</main>

<style>
	label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}
</style>
