# mirrored
The idea: automagic web socket exposure for easy remote code execution

TLDR; I had a project where I created an onboard API interface for a custom piece of hardware in node.js - the problem was that I knew I would have to generate a websockets API for it in order to bridge multiple units across a network connection. It occured to me that in [serial-synpase-socket](https://github.com/hlfshell/serial-synapse-socket) I had a module that would automatically expose a [serial-synapse](https://github.com/hlfshell/serial-synapse) object. This wouldn't work here, since this was a fresh new API and no serial control was present.

So I started experimenting around with it. If you're reading this README, that means I didn't advance it past the idea stage - just like a bajillion other ideas.

The goal is to have a `MirrorHost` object- you then feed it objects which it dynamically creates an API for. You then create a `MirrorClient` object on the client computer, connecting it to the host. The `MirrorHost` will then keep the `MirrorClient` synced, expose in JS object functions, and handle passing the execution of the host's actual object to the cloned object on the client.
