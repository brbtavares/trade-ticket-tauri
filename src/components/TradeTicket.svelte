<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";

	let quantity: number = 1;
	let balance: number = 100000; // valor hardcoded inicial
	let currentTotal: number = 0; // valor hardcoded inicial
	let logMessages: string[] = [];

	async function sendCommand(action: string) {
		try {
			const result = await invoke<string>("trade_action", {
				action,
				quantity,
			});
			appendLog(result);
		} catch (e) {
			appendLog(`Erro: ${e}`);
		}
	}

	function appendLog(message: string) {
		const timestamp = new Date().toISOString();
		logMessages = [...logMessages, `${timestamp} - ${message}`];
	}
</script>

<div class="ticket-container">
	<div class="controls">
		<label for="quantity">QTD:</label>
		<input
			id="quantity"
			type="number"
			bind:value={quantity}
			min="1"
			style="width: 60px;"
		/>

		<span>Saldo: R$ {balance}</span>
	</div>

	<div>
		<span>Total: R$ {currentTotal}</span>
	</div>

	<div class="buttons">
		<button on:click={() => sendCommand("buy")}>Comprar</button>
		<button on:click={() => sendCommand("sell")}>Vender</button>
		<button on:click={() => sendCommand("close")}>Zerar Posição</button>
	</div>

	<div class="log">
		{#each logMessages as msg}
			<div>{msg}</div>
		{/each}
	</div>
</div>

<style>
	.ticket-container {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		max-width: 400px;
		border: 1px solid #ccc;
		border-radius: 8px;
		background: #fdfdfd;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.buttons {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.log {
		height: 150px;
		overflow-y: auto;
		background: #f9f9f9;
		border: 1px solid #ddd;
		padding: 4px;
		font-size: 0.9em;
		white-space: pre-wrap;
	}
</style>
