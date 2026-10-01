
# Week 1 Day 2 --- Introduction to AI Engineering

**Course:** AI Backend Engineer Bootcamp --- Mastering Backend
**Student:** Greg Odi

## 1. Define an AI engineer in your own words

An AI engineer is a software engineer who builds applications and
systems that use artificial intelligence models to solve real-world
problems. The role involves working with LLMs, embeddings, RAG,
inference, prompts, context, agents, APIs, and the backend systems that
make AI capabilities reliable in production. An ML engineer is more
focused on developing, training, evaluating, and deploying
machine-learning models and pipelines, while a regular backend engineer
primarily builds server-side APIs, databases, authentication, and
business logic without necessarily integrating AI. An AI engineer
therefore sits at the intersection of software engineering and applied
AI.

## 2. Map the 12 terminology terms to concrete capstone examples

  -----------------------------------------------------------------------
  Term                    Meaning                 Concrete Capstone
                                                  Example
  ----------------------- ----------------------- -----------------------
  AI                      Technology that enables AI-powered assistant
                          computers to perform    for financial-risk
                          tasks associated with   information.
                          human intelligence.     

  AGI                     Hypothetical artificial The capstone does not
                          general intelligence    implement AGI; it is a
                          capable of a broad      broader concept.
                          range of intellectual   
                          tasks.                  

  LLM                     Large Language Model    LLM used to answer
                          that learns patterns in questions using
                          language and generates  retrieved risk
                          text.                   documents.

  Embeddings              Numerical vector        Convert document chunks
                          representations that    and questions into
                          capture semantic        vectors for semantic
                          relationships in text.  search.

  Training                Process of adjusting    The capstone uses
                          model parameters using  existing models rather
                          data so the model       than training a model
                          learns patterns.        from scratch.

  Inference               Using a trained model   Send the question and
                          to generate an output   retrieved context to an
                          from an input.          LLM and receive an
                                                  answer.

  Vector Database         Database designed to    Store document
                          store and search vector embeddings and retrieve
                          representations.        relevant risk-document
                                                  chunks.

  AI Agent                AI system that can      An agent could retrieve
                          reason about a task and financial information
                          use tools/actions to    and perform a
                          accomplish it.          risk-analysis workflow.

  RAG                     Retrieval-Augmented     Retrieve relevant
                          Generation: retrieve    document chunks and
                          relevant information    provide them to the LLM
                          and provide it to an    for Q&A.
                          LLM before generation.  

  Context Window          Amount of tokens a      Keep retrieved chunks,
                          model can consider in a instructions, and
                          request.                history within the
                                                  model limit.

  Fine-tuning             Further training of a   Not the primary
                          pretrained model on a   approach for changing
                          specialized dataset.    document knowledge in
                                                  the capstone.

  Prompt/Context          Designing instructions  Build the system prompt
  Engineering             and selecting the right and assemble retrieved
                          context for the model.  chunks, history, and
                                                  question before
                                                  inference.
  -----------------------------------------------------------------------

## 3. Why is RAG preferred over fine-tuning for document Q&A?

RAG is preferred when the application needs to answer questions using
documents that may change. It avoids the cost of retraining a model
whenever documents change, provides fresher information because the
retrieval source can be updated independently, and reduces the
maintenance burden because the knowledge base can be maintained without
repeatedly modifying the model. Fine-tuning is more appropriate when the
goal is to change or specialize model behavior rather than simply
provide changing factual information from documents.

## 4. Calculate the token cost of one RAG query

-   System prompt: \~200 tokens
-   5 retrieved chunks: \~2,000 tokens
-   Conversation history: \~600 tokens
-   Question: \~20 tokens
-   Response: \~500 tokens

**Input = 2,820 tokens. Output = 500 tokens.**

Using the course GPT-4o-mini pricing: - Input: \$0.15 per 1 million
tokens - Output: \$0.60 per 1 million tokens

``` text
Input cost = 2,820 / 1,000,000 × $0.15 = $0.000423
Output cost = 500 / 1,000,000 × $0.60 = $0.000300
Total = $0.000723 per question
10,000 questions/day = $7.23 per day
```

## 5. What happens inside the model when generating the next token?

The model processes the input context and calculates a probability
distribution over possible next tokens. Each possible token receives a
probability based on the context that came before it. The decoding
settings determine how the next token is selected from that
distribution. The selected token is added to the context and the model
repeats the process until the response is complete or the output limit
is reached.

## 6. Define temperature = 0 vs 0.3 and choose a capstone value

Temperature 0 makes generation highly deterministic and strongly favors
the highest-probability choices. Temperature 0.3 introduces some
variation while remaining relatively controlled.

The capstone RAG setting is **temperature = 0.1** because factual
document Q&A prioritizes consistency and predictable behavior over
creativity.

## 7. Walk through Top-P = 0.9

Given probabilities:

``` text
A = 40%
B = 25%
C = 15%
D = 10%
E = 5%
F = 3%
G = 2%
```

  Token     Probability   Cumulative
  ------- ------------- ------------
  A                 40%          40%
  B                 25%          65%
  C                 15%          80%
  D                 10%          90%
  E                  5%          95%
  F                  3%          98%
  G                  2%         100%

At **Top-P = 0.9**, the nucleus contains **A, B, C, and D**, because
their cumulative probability reaches 90%.

## 8. Why is Top-P generally preferred over Top-K in production?

Top-K keeps a fixed number of candidate tokens. Top-P keeps the smallest
set of highest-probability tokens whose cumulative probability reaches
the selected threshold.

If the first four tokens already account for 90% of the probability
mass, Top-P=0.9 can retain those four, while Top-K=50 can retain many
additional very-low-probability tokens that Top-P excludes.

## 9. Research text-embedding-3-small

-   **Model:** `text-embedding-3-small`
-   **Default output dimensions:** 1536
-   **Maximum input:** 8192 tokens
-   **Input cost:** \$0.02 per 1 million tokens

The model converts text into numerical vector representations that can
be used for semantic search and related tasks.

OpenAI documentation:
https://developers.openai.com/api/docs/models/text-embedding-3-small

## 10. Explain the "lost in the middle" problem

The "lost in the middle" problem refers to reduced attention or use of
information positioned in the middle of a long context compared with
information near the beginning or end. For RAG, document chunks should
therefore be organized deliberately rather than placed randomly in a
long prompt. The course material emphasizes placing important
instructions at the beginning and retrieved document chunks close to the
question near the end.


