<div class="acp-page-container">
	<!-- IMPORT admin/partials/settings/header.tpl -->

	<div class="row m-0">
		<div id="spy-container" class="col-12 col-md-8 px-0 mb-4" tabindex="0">
			<form role="form" class="openai-settings">
				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">[[openai:admin.general]]</h5>

					<div class="mb-3">
						<label class="form-label" for="apikey">[[openai:admin.api-key]]</label>
						<input type="text" id="apikey" name="apikey" title="API Key" class="form-control">
						<p class="form-text">
							[[openai:admin.api-key-help]]
						</p>
					</div>

					<div class="mb-3">
						<label class="form-label" for="apiBaseUrl">[[openai:admin.api-base-url]]</label>
						<input type="text" id="apiBaseUrl" name="apiBaseUrl" title="API Base Url" class="form-control">
						<p class="form-text">
							[[openai:admin.api-base-url-help]]
						</p>
					</div>

					<div class="mb-3">
						<label class="form-label" for="chatgpt-username">[[openai:admin.chatgpt-username]]</label>
						<input type="text" id="chatgpt-username" name="chatgpt-username" title="ChatGPT Username" class="form-control">
						<p class="form-text">
							<a href="{config.relative_path}/admin/manage/users">[[openai:admin.create-user]]</a> [[openai:admin.chatgpt-username-help]]
						</p>
					</div>

					<div class="form-check form-switch">
						<input type="checkbox" class="form-check-input" id="enablePrivateMessages" name="enablePrivateMessages">
						<label for="enablePrivateMessages" class="form-check-label">[[openai:admin.enable-private-messages]]</label>
						<p class="form-text">
							[[openai:admin.enable-private-messages-help]]
						</p>
					</div>

					<div class="mb-3">
						<label class="form-label" for="model">[[openai:admin.model]]</label>
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
						<label class="form-label" for="systemPrompt">[[openai:admin.system-prompt]]</label>
						<textarea class="form-control" id="systemPrompt" name="systemPrompt" title="System prompt" placeholder="[[openai:admin.system-prompt-placeholder]]" rows="8"></textarea>
					</div>
				</div>

				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">[[openai:admin.mention-settings]]</h5>
					<p class="form-text mb-3">
						[[openai:admin.mention-settings-help]]
					</p>

					<div class="mb-3">
						<label class="form-label" for="mentionApiKey">[[openai:admin.mention-api-key]]</label>
						<input type="text" id="mentionApiKey" name="mentionApiKey" title="Mention API Key" class="form-control">
						<p class="form-text">
							[[openai:admin.mention-api-key-help]]
						</p>
					</div>

					<div class="mb-3">
						<label class="form-label" for="mentionApiBaseUrl">[[openai:admin.mention-api-base-url]]</label>
						<input type="text" id="mentionApiBaseUrl" name="mentionApiBaseUrl" title="Mention API Base URL" class="form-control">
						<p class="form-text">
							[[openai:admin.mention-api-base-url-help]]
						</p>
					</div>
				</div>

				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">[[openai:admin.topic-summary]]</h5>

					<div class="mb-3">
						<label class="form-label" for="summarySystemPrompt">[[openai:admin.summary-system-prompt]]</label>
						<textarea class="form-control" id="summarySystemPrompt" name="summarySystemPrompt" title="Summary system prompt" placeholder="[[openai:admin.summary-system-prompt-placeholder]]" rows="6"></textarea>
						<p class="form-text">
							[[openai:admin.summary-system-prompt-help]]
						</p>
					</div>

					<div class="mb-3">
						<label class="form-label" for="summaryFinalSystemPrompt">[[openai:admin.summary-final-system-prompt]]</label>
						<textarea class="form-control" id="summaryFinalSystemPrompt" name="summaryFinalSystemPrompt" title="Final summary system prompt" placeholder="[[openai:admin.summary-final-system-prompt-placeholder]]" rows="6"></textarea>
						<p class="form-text">
							[[openai:admin.summary-final-system-prompt-help]]
						</p>
					</div>

					<div class="form-check form-switch">
						<input type="checkbox" class="form-check-input" id="summaryRenderMarkdown" name="summaryRenderMarkdown">
						<label for="summaryRenderMarkdown" class="form-check-label">[[openai:admin.summary-render-markdown]]</label>
						<p class="form-text">
							[[openai:admin.summary-render-markdown-help]]
						</p>
					</div>
				</div>

				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">[[openai:admin.restrictions]]</h5>
					<p class="form-text mb-3">
						[[openai:admin.restrictions-help]]
					</p>

					<div class="mb-3">
						<label class="form-label" for="minimumReputation">[[openai:admin.minimum-reputation]]</label>
						<input type="text" id="minimumReputation" name="minimumReputation" title="Minimum Reputation" class="form-control">
						<p class="form-text">
							[[openai:admin.minimum-reputation-help]]
						</p>
					</div>
					<div class="mb-3">
						<label class="form-label" form="allowedGroups">[[openai:admin.allowed-groups]]</label>
						<select class="form-select" multiple id="allowedGroups" name="allowedGroups" size="10">
							{{{ each groups }}}
							<option value="{./displayName}">{./displayName}</option>
							{{{ end }}}
						</select>
						<p class="form-text">
							[[openai:admin.allowed-groups-help]]
						</p>
					</div>
				</div>

				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">[[openai:admin.mention-restrictions]]</h5>
					<p class="form-text mb-3">
						[[openai:admin.mention-restrictions-help]]
					</p>

					<div class="mb-3">
						<label class="form-label" for="mentionMinimumReputation">[[openai:admin.mention-minimum-reputation]]</label>
						<input type="text" id="mentionMinimumReputation" name="mentionMinimumReputation" title="Mention Minimum Reputation" class="form-control">
						<p class="form-text">
							[[openai:admin.mention-minimum-reputation-help]]
						</p>
					</div>
					<div class="mb-3">
						<label class="form-label" form="mentionAllowedGroups">[[openai:admin.mention-allowed-groups]]</label>
						<select class="form-select" multiple id="mentionAllowedGroups" name="mentionAllowedGroups" size="10">
							{{{ each groups }}}
							<option value="{./displayName}">{./displayName}</option>
							{{{ end }}}
						</select>
						<p class="form-text">
							[[openai:admin.mention-allowed-groups-help]]
						</p>
					</div>
				</div>

				<div class="">
					<h5 class="fw-bold tracking-tight settings-header">[[openai:admin.pm-restrictions]]</h5>
					<p class="form-text mb-3">
						[[openai:admin.pm-restrictions-help]]
					</p>

					<div class="mb-3">
						<label class="form-label" for="pmApiKey">[[openai:admin.pm-api-key]]</label>
						<input type="text" id="pmApiKey" name="pmApiKey" title="Chat API Key" class="form-control">
						<p class="form-text">
							[[openai:admin.pm-api-key-help]]
						</p>
					</div>
					<div class="mb-3">
						<label class="form-label" for="pmApiBaseUrl">[[openai:admin.pm-api-base-url]]</label>
						<input type="text" id="pmApiBaseUrl" name="pmApiBaseUrl" title="Chat API Base URL" class="form-control">
						<p class="form-text">
							[[openai:admin.pm-api-base-url-help]]
						</p>
					</div>

					<div class="mb-3">
						<label class="form-label" for="pmMinimumReputation">[[openai:admin.pm-minimum-reputation]]</label>
						<input type="text" id="pmMinimumReputation" name="pmMinimumReputation" title="Chat Minimum Reputation" class="form-control">
						<p class="form-text">
							[[openai:admin.pm-minimum-reputation-help]]
						</p>
					</div>
					<div class="mb-3">
						<label class="form-label" form="pmAllowedGroups">[[openai:admin.pm-allowed-groups]]</label>
						<select class="form-select" multiple id="pmAllowedGroups" name="pmAllowedGroups" size="10">
							{{{ each groups }}}
							<option value="{./displayName}">{./displayName}</option>
							{{{ end }}}
						</select>
						<p class="form-text">
							[[openai:admin.pm-allowed-groups-help]]
						</p>
					</div>
					<div class="mb-3">
						<label class="form-label" for="pmNoPermissionMessage">[[openai:admin.pm-no-permission-message]]</label>
						<input type="text" id="pmNoPermissionMessage" name="pmNoPermissionMessage" title="No Permission Message" class="form-control" placeholder="[[openai:no-permission-to-chat]]">
						<p class="form-text">
							[[openai:admin.pm-no-permission-message-help]]
						</p>
					</div>
				</div>
			</form>
		</div>

		<!-- IMPORT admin/partials/settings/toc.tpl -->
	</div>
</div>
