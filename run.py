loop = asyncio.get_event_loop()
defines = loop.run_until_complete(func())
loop.close()
