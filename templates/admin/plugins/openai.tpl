<div class="acp-page-container">
	<!-- IMPORT admin/partials/settings/header.tpl -->

	<div class="row m-0">
		<div id="spy-container" class="col-12 col-md-8 px-0 mb-4" tabindex="0">
			<form role="form" class="openai-settings">
				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">General</h5>

					<div class="mb-3">
						<label class="form-label" for="apikey">API Key</label>
						<input type="text" id="apikey" name="apikey" title="API Key" class="form-control">
						<p class="form-text">
							Get your <a href="https://platform.openai.com/api-keys">API Key</a> and enter it above. You can enter a Google Gemini API key if you want to use Google Gemini. Don't forget to change the model used to a gemini variant. Requires a restart.
						</p>
					</div>

					<div class="mb-3">
						<label class="form-label" for="apiBaseUrl">API Base Url</label>
						<input type="text" id="apiBaseUrl" name="apiBaseUrl" title="API Base Url" class="form-control">
						<p class="form-text">
							If you want to use Google's Gemini API, enter the base URL here (https://generativelanguage.googleapis.com/v1beta/openai/). Otherwise, leave it blank to use OpenAI's API. Requires a restart.
						</p>
					</div>

					<div class="mb-3">
						<label class="form-label" for="chatgpt-username">ChatGPT Username</label>
						<input type="text" id="chatgpt-username" name="chatgpt-username" title="ChatGPT Username" class="form-control">
						<p class="form-text">
							<a href="{config.relative_path}/admin/manage/users">Create a user</a> and enter their username. Other users can mention this user to ask questions to ChatGPT or send private messages if enabled below.
						</p>
					</div>

					<div class="form-check form-switch">
						<input type="checkbox" class="form-check-input" id="enablePrivateMessages" name="enablePrivateMessages">
						<label for="enablePrivateMessages" class="form-check-label">Enable Private Messages</label>
						<p class="form-text">
							If enabled users can send ChatGPT user private messages.
						</p>
					</div>

					<div class="mb-3">
						<label class="form-label" for="model">Model</label>
						<select class="form-select" id="model" name="model" title="Model">
							<option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
							<option value="gpt-4o-mini">gpt-4o-mini</option>
							<option value="gpt-4o">gpt-4o</option>
							<option value="gpt-4-turbo">gpt-4-turbo</option>
							<option value="gpt-4">gpt-4</option>
							<option value="gpt-4.1-mini">gpt-4.1-mini</option>
							<option value="gpt-4.1">gpt-4.1</option>
							<option value="gemini-2.5-pro">gemini-2.5-pro</option>
							<option value="gemini-2.5-flash">gemini-2.5-flash</option>
							<option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
							<option value="gemini-3-flash">gemini-3-flash</option>
							<option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
							<option value="gemini-2.0-flash">gemini-2.0-flash</option>
							<option value="gemma-3-27b-it">gemma-3-27b-it</option>
							<option value="gemma-3-12b-it">gemma-3-12b-it</option>
							<option value="gemma-3-4b-it">gemma-3-4b-it</option>
							<option value="gemma-4-31b-it">gemma-4-31b-it</option>
							<option value="gemma-4-26b-a4b-it">gemma-4-26b-a4b-it</option>
							<option value="gemma-4-e4b-it">gemma-4-e4b-it</option>
							<option value="gemma-4-e2b-it">gemma-4-e2b-it</option>
						</select>
					</div>
					<div class="mb-3">
						<label class="form-label" for="systemPrompt">System Prompt</label>
						<textarea class="form-control" id="systemPrompt" name="systemPrompt" title="System prompt" placeholder="You are a helpful assistant" rows="8"></textarea>
					</div>
				</div>

				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">Topic Summary</h5>

					<div class="mb-3">
						<label class="form-label" for="summarySystemPrompt">Summary System Prompt</label>
						<textarea class="form-control" id="summarySystemPrompt" name="summarySystemPrompt" title="Summary system prompt" placeholder="You summarize discussion forum threads into concise summaries." rows="6"></textarea>
						<p class="form-text">
							System prompt used when summarizing each chunk of a topic. Leave blank to use the default. You can write this in any language (e.g. Hebrew) to control the summary's language and style.
						</p>
					</div>

					<div class="mb-3">
						<label class="form-label" for="summaryFinalSystemPrompt">Final Summary System Prompt</label>
						<textarea class="form-control" id="summaryFinalSystemPrompt" name="summaryFinalSystemPrompt" title="Final summary system prompt" placeholder="You are an assistant that summarizes forum thread summaries into a single cohesive summary." rows="6"></textarea>
						<p class="form-text">
							System prompt used to merge multiple chunk-summaries into a single final summary (only triggered for long topics). Leave blank to use the default.
						</p>
					</div>

					<div class="form-check form-switch">
						<input type="checkbox" class="form-check-input" id="summaryRenderMarkdown" name="summaryRenderMarkdown">
						<label for="summaryRenderMarkdown" class="form-check-label">Render summary as Markdown</label>
						<p class="form-text">
							If enabled, the summary dialog will render Markdown (bold, lists, headings, etc.). If disabled, the summary is shown as plain text.
						</p>
					</div>
				</div>

				<div class="">
					<h5 class="fw-bold tracking-tight settings-header">Restrictions</h5>

					<div class="mb-3">
						<label class="form-label" for="minimumReputation">Minimum Reputation</label>
						<input type="text" id="minimumReputation" name="minimumReputation" title="Minimum Reputation" class="form-control">
						<p class="form-text">
							Minimum reputation required to mention chatgpt user. (0 to disable)
						</p>
					</div>
					<div class="mb-3">
						<label class="form-label" form="allowedGroups">Allowed Groups</label>
						<select class="form-select" multiple id="allowedGroups" name="allowedGroups" size="10">
							{{{ each groups }}}
							<option value="{./displayName}">{./displayName}</option>
							{{{ end }}}
						</select>
						<p class="form-text">
							Only users in these groups will be able to mention the chatgpt user. Leave blank to allow all groups.
						</p>
					</div>
				</div>
			</form>
		</div>

		<!-- IMPORT admin/partials/settings/toc.tpl -->
	</div>
</div>
