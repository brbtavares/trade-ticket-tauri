<script lang="ts">
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';

  let tipoSL = "Desativado";
  let valorSL = 0;

  let tipoTP = "Desativado";
  let valorTP = 0;

  let ativo = "WINM25";
  let quantidade = 1;
  let tipoOrdem = "Mercado";

  let logs: string[] = [];

  const tiposAlvo = ["Desativado", "R$", "% da conta", "Pontos", "ATR", "Bollinger"];

  async function enviarOrdem(direcao: "Compra" | "Venda") {
    const ordem = {
      ativo,
      quantidade,
      tipo_ordem: tipoOrdem,
      direcao,
      sl: tipoSL === "Desativado" ? null : { tipo: tipoSL, valor: valorSL },
      tp: tipoTP === "Desativado" ? null : { tipo: tipoTP, valor: valorTP },
      timestamp: new Date().toISOString()
    };

    try {
      await invoke("salvar_ordem", { ordem });
      logs = [`[${ordem.timestamp}] Ordem ${direcao} enviada`, ...logs];
    } catch (e) {
      logs = [`[${new Date().toISOString()}] Erro: ${e}`, ...logs];
    }
  }
</script>

<main class="p-4 max-w-md mx-auto space-y-4">
  <h1 class="text-xl font-bold">Boleta Tauri</h1>

  <div>
    <label>Ativo</label>
    <input bind:value={ativo} class="w-full border px-2 py-1 mb-2" />
  </div>

  <div>
    <label>Quantidade</label>
    <input type="number" bind:value={quantidade} class="w-full border px-2 py-1 mb-2" />
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
      <input type="number" bind:value={valorSL} placeholder="Valor SL" class="w-full border px-2 py-1" />
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
      <input type="number" bind:value={valorTP} placeholder="Valor TP" class="w-full border px-2 py-1" />
    {/if}
  </div>

  <div class="flex justify-between">
    <button on:click={() => enviarOrdem("Compra")} class="bg-green-500 text-white px-4 py-2 rounded">Comprar</button>
    <button on:click={() => enviarOrdem("Venda")} class="bg-red-500 text-white px-4 py-2 rounded">Vender</button>
  </div>

  <div class="mt-4">
    <h2 class="font-semibold mb-2">Logs</h2>
    <ul class="text-sm bg-gray-100 p-2 rounded h-40 overflow-auto">
      {#each logs as log}
        <li>{log}</li>
      {/each}
    </ul>
  </div>
</main>

<style>
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
</style>
