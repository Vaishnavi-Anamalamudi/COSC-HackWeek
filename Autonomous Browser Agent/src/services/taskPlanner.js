const plannerSchema = {
  intent: 'google_search | youtube_search | github_search | wikipedia_lookup | product_search | compare | form_fill | appointment | headlines | weather | currency | generic',
  query: 'string',
  targetUrl: 'string',
  steps: ['short browser actions']
};

function createSteps(labels) {
  return labels.map((label, index) => ({
    id: `step-${index + 1}`,
    label,
    detail: 'Pending',
    status: 'pending'
  }));
}

function stripCommand(command, patterns) {
  let query = command;
  for (const pattern of patterns) query = query.replace(pattern, ' ');
  return query.replace(/[.?]/g, ' ').replace(/\s+/g, ' ').trim();
}

function fallbackPlan(command) {
  const lower = command.toLowerCase();

  if (lower.includes('youtube')) {
    const query = stripCommand(command, [/search/i, /for/i, /on youtube/i, /youtube/i]);
    return {
      intent: 'youtube_search',
      query: query || 'React tutorials',
      targetUrl: 'https://www.youtube.com/results',
      steps: createSteps(['Open YouTube', 'Search videos', 'Extract video results', 'Summarize findings'])
    };
  }

  if (lower.includes('github')) {
    const query = stripCommand(command, [/open github/i, /github/i, /search/i, /for/i, /repositories/i, /repository/i]);
    return {
      intent: 'github_search',
      query: query || 'Spring Boot',
      targetUrl: 'https://github.com/search',
      steps: createSteps(['Open GitHub', 'Search repositories', 'Extract repository cards', 'Summarize findings'])
    };
  }

  if (lower.includes('wikipedia')) {
    const query = stripCommand(command, [/search/i, /wikipedia/i, /lookup/i, /for/i]);
    return {
      intent: 'wikipedia_lookup',
      query: query || 'autonomous agents',
      targetUrl: 'https://en.wikipedia.org/w/index.php',
      steps: createSteps(['Open Wikipedia', 'Search article', 'Read article sections', 'Summarize page'])
    };
  }

  if (lower.includes('weather')) {
    const query = stripCommand(command, [/search/i, /today'?s/i, /weather/i, /in/i]);
    return {
      intent: 'weather',
      query: `today weather ${query}`.trim(),
      targetUrl: 'https://www.google.com/search',
      steps: createSteps(['Open Google', 'Search weather', 'Extract weather snapshot', 'Return summary'])
    };
  }

  if (lower.includes('currency') || lower.includes('convert')) {
    return {
      intent: 'currency',
      query: stripCommand(command, [/search/i, /currency/i]) || command,
      targetUrl: 'https://www.google.com/search',
      steps: createSteps(['Open Google', 'Search currency conversion', 'Extract conversion answer', 'Return summary'])
    };
  }

  if (lower.includes('form') || lower.includes('registration')) {
    return {
      intent: 'form_fill',
      query: 'demo registration form',
      targetUrl: 'about:blank',
      steps: createSteps(['Open demo form', 'Fill required fields', 'Submit form', 'Verify confirmation'])
    };
  }

  if (lower.includes('appointment') || lower.includes('booking')) {
    return {
      intent: 'appointment',
      query: 'demo appointment',
      targetUrl: 'about:blank',
      steps: createSteps(['Open appointment form', 'Choose service and date', 'Submit booking', 'Verify confirmation'])
    };
  }

  if (lower.includes('headline') || lower.includes('news')) {
    return {
      intent: 'headlines',
      query: stripCommand(command, [/collect/i, /latest/i, /headlines/i, /news/i]) || 'technology news',
      targetUrl: 'https://news.google.com/search',
      steps: createSteps(['Open news search', 'Search topic', 'Collect headlines', 'Summarize headlines'])
    };
  }

  if (lower.includes('compare') || lower.includes(' vs ') || lower.includes(' versus ')) {
    return {
      intent: 'compare',
      query: stripCommand(command, [/compare/i]) || command,
      targetUrl: 'https://www.google.com/search',
      steps: createSteps(['Open Google', 'Search comparison', 'Extract comparison results', 'Return differences'])
    };
  }

  if (lower.includes('amazon') || lower.includes('flipkart') || lower.includes('laptop') || lower.includes('cheapest')) {
    const marketplace = lower.includes('flipkart') ? 'Flipkart' : lower.includes('amazon') ? 'Amazon' : 'Google';
    return {
      intent: 'product_search',
      query: stripCommand(command, [/find/i, /search/i, /for/i, /on amazon/i, /on flipkart/i]) || command,
      targetUrl: marketplace === 'Flipkart' ? 'https://www.flipkart.com/search' : marketplace === 'Amazon' ? 'https://www.amazon.in/s' : 'https://www.google.com/search',
      marketplace,
      steps: createSteps([`Open ${marketplace}`, 'Search products', 'Extract product candidates', 'Rank and summarize'])
    };
  }

  return {
    intent: 'google_search',
    query: stripCommand(command, [/search/i, /google/i, /for/i]) || command,
    targetUrl: 'https://www.google.com/search',
    steps: createSteps(['Open Google', 'Search query', 'Extract top results', 'Return summary'])
  };
}

async function aiPlan(command) {
  if (!process.env.OPENAI_API_KEY) return null;

  const response = await fetch(`${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You convert browser automation requests into JSON matching this schema: ${JSON.stringify(plannerSchema)}. Use only safe, legal browsing actions.`
        },
        { role: 'user', content: command }
      ]
    })
  });

  if (!response.ok) throw new Error(`AI planner failed with ${response.status}`);
  const data = await response.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');

  return {
    ...parsed,
    steps: createSteps((parsed.steps || []).slice(0, Number(process.env.MAX_AGENT_STEPS || 8)))
  };
}

export async function createPlan(command, log) {
  try {
    const planned = await aiPlan(command);
    if (planned?.intent && planned?.steps?.length) {
      log?.('AI planner produced a browser plan.');
      return planned;
    }
  } catch (error) {
    log?.(`AI planner unavailable, using local parser: ${error.message}`, 'warn');
  }

  log?.('Using local command parser fallback.');
  return fallbackPlan(command);
}
