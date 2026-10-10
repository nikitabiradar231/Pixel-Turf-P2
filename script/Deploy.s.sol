// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {PixelTurf} from "../src/PixelTurf.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public returns (PixelTurf canvas) {
        uint256 deployerPrivateKey;
        try vm.envUint("PRIVATE_KEY") returns (uint256 pk) {
            deployerPrivateKey = pk;
        } catch {
            deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        }

        uint256 cooldown = vm.envOr("COOLDOWN_SECONDS", uint256(60));

        if (deployerPrivateKey != 0) {
            vm.startBroadcast(deployerPrivateKey);
        } else {
            vm.startBroadcast();
        }

        canvas = new PixelTurf(cooldown);

        console.log("PixelTurf deployed at:", address(canvas));
        console.log("Canvas Width:", canvas.WIDTH());
        console.log("Canvas Height:", canvas.HEIGHT());
        console.log("Cooldown (seconds):", canvas.COOLDOWN());

        vm.stopBroadcast();
    }
}
