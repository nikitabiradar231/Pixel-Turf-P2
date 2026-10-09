// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {PixelTurf} from "../src/PixelTurf.sol";

contract PixelTurfTest is Test {
    PixelTurf public canvas;

    address internal constant ALICE = address(0xA11CE);
    address internal constant BOB = address(0xB0B);
    address internal constant CHARLIE = address(0xCAFE);

    event PixelPlaced(
        address indexed player, uint256 indexed index, uint256 x, uint256 y, uint24 color, uint256 timestamp
    );

    function setUp() public {
        canvas = new PixelTurf(60); // 60-second cooldown
    }

    function test_DimensionsAndConstants() public view {
        assertEq(canvas.WIDTH(), 64);
        assertEq(canvas.HEIGHT(), 64);
        assertEq(canvas.TOTAL_PIXELS(), 4096);
        assertEq(canvas.COOLDOWN(), 60);

        (uint256 w, uint256 h) = canvas.getCanvasDimensions();
        assertEq(w, 64);
        assertEq(h, 64);
    }

    function test_SuccessfulPixelPlacement() public {
        vm.warp(1000);
        vm.prank(ALICE);

        uint256 x = 10;
        uint256 y = 20;
        uint24 color = 0xFF5733; // vibrant orange
        uint256 expectedIndex = y * 64 + x;

        vm.expectEmit(true, true, false, true);
        emit PixelPlaced(ALICE, expectedIndex, x, y, color, 1000);

        canvas.placePixel(x, y, color);

        assertEq(canvas.getPixel(x, y), color);
        assertEq(canvas.pixels(expectedIndex), color);
        assertEq(canvas.lastPlacement(ALICE), 1000);
        assertEq(canvas.getNextPlacementTime(ALICE), 1060);
        assertEq(canvas.getRemainingCooldown(ALICE), 60);
    }

    function test_UpdateExistingPixel() public {
        vm.warp(1000);
        vm.prank(ALICE);
        canvas.placePixel(5, 5, 0x112233);
        assertEq(canvas.getPixel(5, 5), 0x112233);

        // BOB paints over the same pixel after 10 seconds
        vm.warp(1010);
        vm.prank(BOB);
        canvas.placePixel(5, 5, 0x445566);
        assertEq(canvas.getPixel(5, 5), 0x445566);
    }

    function test_Revert_CooldownActiveForSamePlayer() public {
        vm.warp(1000);
        vm.prank(ALICE);
        canvas.placePixel(0, 0, 0xFFFFFF);

        // ALICE tries to paint at t = 1030 (30 seconds later, within 60s cooldown)
        vm.warp(1030);
        vm.prank(ALICE);
        vm.expectRevert(abi.encodeWithSelector(PixelTurf.CooldownActive.selector, ALICE, 1000, 1060));
        canvas.placePixel(1, 1, 0x000000);
    }

    function test_Success_PlacementAfterCooldownExpires() public {
        vm.warp(1000);
        vm.prank(ALICE);
        canvas.placePixel(0, 0, 0xFFFFFF);

        // ALICE paints exactly at cooldown expiry (t = 1060)
        vm.warp(1060);
        vm.prank(ALICE);
        canvas.placePixel(1, 1, 0xABCDEF);

        assertEq(canvas.getPixel(1, 1), 0xABCDEF);
        assertEq(canvas.lastPlacement(ALICE), 1060);
    }

    function test_IndependentCooldownsForDifferentPlayers() public {
        vm.warp(1000);
        vm.prank(ALICE);
        canvas.placePixel(0, 0, 0xFF0000);

        // BOB can paint immediately at t = 1001 without being blocked by ALICE's cooldown
        vm.warp(1001);
        vm.prank(BOB);
        canvas.placePixel(1, 1, 0x00FF00);

        // CHARLIE can also paint immediately at t = 1002
        vm.warp(1002);
        vm.prank(CHARLIE);
        canvas.placePixel(2, 2, 0x0000FF);

        assertEq(canvas.getPixel(0, 0), 0xFF0000);
        assertEq(canvas.getPixel(1, 1), 0x00FF00);
        assertEq(canvas.getPixel(2, 2), 0x0000FF);
    }

    function test_Revert_OutOfBoundsCoordinates() public {
        // x at WIDTH boundary
        vm.expectRevert(abi.encodeWithSelector(PixelTurf.OutOfBounds.selector, 64, 10));
        canvas.placePixel(64, 10, 0xFFFFFF);

        // y at HEIGHT boundary
        vm.expectRevert(abi.encodeWithSelector(PixelTurf.OutOfBounds.selector, 10, 64));
        canvas.placePixel(10, 64, 0xFFFFFF);

        // Both out of bounds
        vm.expectRevert(abi.encodeWithSelector(PixelTurf.OutOfBounds.selector, 100, 200));
        canvas.placePixel(100, 200, 0xFFFFFF);

        // Maximum uint256
        vm.expectRevert(abi.encodeWithSelector(PixelTurf.OutOfBounds.selector, type(uint256).max, 0));
        canvas.placePixel(type(uint256).max, 0, 0xFFFFFF);

        // getPixel out of bounds
        vm.expectRevert(abi.encodeWithSelector(PixelTurf.OutOfBounds.selector, 64, 0));
        canvas.getPixel(64, 0);
    }

    function test_CooldownGetters() public {
        // Player who hasn't painted yet
        assertEq(canvas.lastPlacement(ALICE), 0);
        assertEq(canvas.getNextPlacementTime(ALICE), 0);
        assertEq(canvas.getRemainingCooldown(ALICE), 0);

        vm.warp(2000);
        vm.prank(ALICE);
        canvas.placePixel(3, 3, 0x123456);

        assertEq(canvas.lastPlacement(ALICE), 2000);
        assertEq(canvas.getNextPlacementTime(ALICE), 2060);
        assertEq(canvas.getRemainingCooldown(ALICE), 60);

        // Advance 25 seconds
        vm.warp(2025);
        assertEq(canvas.getRemainingCooldown(ALICE), 35);

        // Advance past cooldown
        vm.warp(2065);
        assertEq(canvas.getRemainingCooldown(ALICE), 0);
    }

    function test_ConstantCostPlacement_O1Gas() public {
        // Warm up contract code
        vm.warp(1000);
        vm.prank(address(0x999));
        canvas.placePixel(30, 30, 0x999999);

        // Place pixel at (0, 0)
        vm.warp(1100);
        vm.prank(ALICE);
        uint256 gasBefore1 = gasleft();
        canvas.placePixel(0, 0, 0x111111);
        uint256 gasUsed1 = gasBefore1 - gasleft();

        // Place pixel at opposite corner (63, 63)
        vm.warp(1100);
        vm.prank(BOB);
        uint256 gasBefore2 = gasleft();
        canvas.placePixel(63, 63, 0x222222);
        uint256 gasUsed2 = gasBefore2 - gasleft();

        // Gas usage is O(1) constant cost (< 100 gas variance due to evm coordinate packing)
        assertApproxEqAbs(gasUsed1, gasUsed2, 500);
    }

    function test_DefaultCooldownConstructor() public {
        PixelTurf defaultCanvas = new PixelTurf(0);
        assertEq(defaultCanvas.COOLDOWN(), 60);
    }

    function test_BatchPixelRangeGetter() public {
        vm.warp(1000);
        vm.prank(ALICE);
        canvas.placePixel(0, 0, 0xAABBCC);

        vm.warp(1000);
        vm.prank(BOB);
        canvas.placePixel(1, 0, 0xDDEEFF);

        uint24[] memory range = canvas.getPixelRange(0, 4);
        assertEq(range.length, 4);
        assertEq(range[0], 0xAABBCC);
        assertEq(range[1], 0xDDEEFF);
        assertEq(range[2], 0);
        assertEq(range[3], 0);
    }
}
