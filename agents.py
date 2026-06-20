from langchain.agents import create_agent
# from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from tools import web_search, web_scrape
from groq import Groq
from langchain_groq import ChatGroq


import os 
from dotenv import load_dotenv
load_dotenv()

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0
)

#1st agent
def build_search_agent():
    return create_agent(
        model=llm,
        tools=[web_search],
        system_prompt=(
            "You have access to exactly one tool: web_search. "
            "Never call any other tool, including brave_search, google_search, "
            "or any tool name not explicitly listed above. "
            "If you need to search, you must call web_search."
        ),
    )

#2nd agent
def build_reader_agent():
    return create_agent(
        model=llm,
        tools=[web_scrape],
        system_prompt=(
            "You have access to exactly one tool: web_scrape. "
            "Never call any other tool, including any tool name not explicitly listed above."
        ),

    )

#writter chain
writter_prompt=ChatPromptTemplate.from_messages([
    ("system","You are a helpful assistant that writes a summary of the information provided by the reader agent."),
    ("human","""write the detailed research report on the topic beloa based on the following information provided by the reader agent. Make sure to include all the relevant details and insights from the information. The report should be well-structured and comprehensive. Here is the information:
     Topic: {topic}

     Reserch Information:
     {research_info}
     structurre the report as:
        1. Introduction
        2. key findings(min3 well explained key findings)
        3. Conclusion
     4. sources (list all urls used as sources in the research)

""")
])

writter_chain= writter_prompt | llm | StrOutputParser()

#critic_chain
critic_prompt=ChatPromptTemplate.from_messages([
    ("system","You are a helpful assistant that reviews and critiques the research report written by the writer agent."),
    ("human","""Please review the following research report and provide constructive feedback:

    Report:
    {report}

    respond in this exact format:
     score: x/10

     strength:
     - ...
     - ...

     Area of improvement:
     - ...
     - ...
    """)
])

critic_chain= critic_prompt | llm | StrOutputParser()
