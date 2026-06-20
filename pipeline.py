from agents import build_reader_agent, build_search_agent, writter_chain, critic_chain

def run_reserch_pipeline(topic: str)-> dict:
    state={}

    # search agent working
    print("\n"+"="*50)
    print("step 1 - search agent is working")
    print("\n"+"="*50)

    search_agent= build_search_agent()
    
    search_result = search_agent.invoke({
    "messages": [("user", f"Find recent, reliable and detailed information about: {topic}")]
})
    state["search_result"]= search_result["messages"][-1].content

    print("\n search result", state["search_result"])

    # step 2 - rreader agent
    print("\n"+"="*50)
    print("step 2 - reader agent is working.  ")
    print("\n"+"="*50)

    reader_agents= build_reader_agent()
    reader_result=reader_agents.invoke({
        "messages": [("user",
                      f"based ont he following search results about '{topic}',"
                      f"pick the most relevent URL and scrape it deeper content. \n\n"
                      f"Search Results: \n {state['search_result'][:800]}"                      
                      )]
    })
    state['scraped_content']= reader_result['messages'][-1].content

    print("scraped content \n", state["scraped_content"])

    #step 3 - writter chain
    print("\n"+"="*50)
    print("step 3 - Writer is drafting the report ...")
    print("\n"+"="*50)

    research_combine = (
        f"Search Result : \n {state['search_result']}\n\n"
        f"Detailed scraped content: \n {state['scraped_content']}"
    )

    state["report"]=writter_chain.invoke({
        "topic":topic,
        "research_info": research_combine
    })

    print("\n Final Report \n",state['report'])

    #critic report
    print("\n"+"="*50)
    print("step 4 - critic is reviwing the report ...")
    print("\n"+"="*50)

    state["feedback"]=critic_chain.invoke({
        "report": state["report"]
    })

    print("\n Critic report", state['feedback'])

    return state

if __name__ == "__main__":
    topic= input("\n Enter a reserch topic:")
    run_reserch_pipeline(topic)