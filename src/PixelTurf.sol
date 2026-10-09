// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PixelTurf
 * @notice A decentralized, cooldown-enforced, immutable shared pixel canvas for Road to Devcon VIII.
 * @dev Non-negotiable security: Only the cooldown-limited placePixel function modifies tile state.
 *      No owner, admin, reset, batch painting, or backdoor overwrites exist.
 */
contract PixelTurf {
    // Canvas dimensions
    uint256 public constant WIDTH = 64;
    uint256 public constant HEIGHT = 64;
    uint256 public constant TOTAL_PIXELS = WIDTH * HEIGHT; // 4096

    // Default cooldown duration in seconds between placements per address
    uint256 public immutable COOLDOWN;

    // Storage: packed coordinate index (y * WIDTH + x) => 24-bit RGB color
    mapping(uint256 => uint24) public pixels;

    // Storage: player address => timestamp of last successful pixel placement
    mapping(address => uint256) public lastPlacement;

    // Canonical Event Schema
    event PixelPlaced(
        address indexed player, uint256 indexed index, uint256 x, uint256 y, uint24 color, uint256 timestamp
    );

    // Custom Errors
    error OutOfBounds(uint256 x, uint256 y);
    error CooldownActive(address player, uint256 lastPlacedAt, uint256 nextAllowedAt);

    /**
     * @notice Initializes the PixelTurf canvas with a fixed cooldown duration.
     * @param _cooldownDuration Cooldown in seconds between placements (defaults to 60 if 0 passed).
     */
    constructor(uint256 _cooldownDuration) {
        if (_cooldownDuration == 0) {
            COOLDOWN = 60; // 60 seconds default
        } else {
            COOLDOWN = _cooldownDuration;
        }
    }

    /**
     * @notice Places a single colored pixel on the canvas.
     * @dev Enforces strict bounds checking and player cooldown. Constant O(1) gas cost.
     * @param x X-coordinate (0 <= x < WIDTH)
     * @param y Y-coordinate (0 <= y < HEIGHT)
     * @param color 24-bit RGB color (0x000000 to 0xFFFFFF)
     */
    function placePixel(uint256 x, uint256 y, uint24 color) external {
        // 1. Bounds checking
        if (x >= WIDTH || y >= HEIGHT) {
            revert OutOfBounds(x, y);
        }

        // 2. Cooldown verification for msg.sender
        uint256 lastTime = lastPlacement[msg.sender];
        if (lastTime != 0 && block.timestamp < lastTime + COOLDOWN) {
            revert CooldownActive(msg.sender, lastTime, lastTime + COOLDOWN);
        }

        // 3. Calculate packed index (constant cost)
        uint256 index = y * WIDTH + x;

        // 4. Update state: updates exactly 2 fixed storage slots
        pixels[index] = color;
        lastPlacement[msg.sender] = block.timestamp;

        // 5. Emit canonical PixelPlaced event
        emit PixelPlaced(msg.sender, index, x, y, color, block.timestamp);
    }

    /**
     * @notice Returns the color of a pixel at coordinates (x, y).
     * @param x X-coordinate
     * @param y Y-coordinate
     * @return color 24-bit RGB color
     */
    function getPixel(uint256 x, uint256 y) external view returns (uint24) {
        if (x >= WIDTH || y >= HEIGHT) {
            revert OutOfBounds(x, y);
        }
        return pixels[y * WIDTH + x];
    }

    /**
     * @notice Returns the timestamp when the specified player can paint next.
     * @param player Address of the player
     * @return nextAllowedAt Next allowed placement timestamp (0 if player has never painted)
     */
    function getNextPlacementTime(address player) external view returns (uint256 nextAllowedAt) {
        uint256 lastTime = lastPlacement[player];
        if (lastTime == 0) {
            return 0;
        }
        return lastTime + COOLDOWN;
    }

    /**
     * @notice Returns the remaining cooldown in seconds for a player.
     * @param player Address of the player
     * @return remainingSeconds Seconds remaining until player can paint (0 if ready)
     */
    function getRemainingCooldown(address player) external view returns (uint256 remainingSeconds) {
        uint256 nextTime = this.getNextPlacementTime(player);
        if (nextTime <= block.timestamp) {
            return 0;
        }
        return nextTime - block.timestamp;
    }

    /**
     * @notice Returns the canvas dimensions.
     * @return width Canvas width
     * @return height Canvas height
     */
    function getCanvasDimensions() external pure returns (uint256 width, uint256 height) {
        return (WIDTH, HEIGHT);
    }

    /**
     * @notice Reads a batch region of pixels in a single call (pure view helper).
     * @param startIndex Starting packed index (0 <= startIndex < TOTAL_PIXELS)
     * @param count Number of consecutive pixels to return
     * @return batchColors Array of 24-bit RGB colors
     */
    function getPixelRange(uint256 startIndex, uint256 count) external view returns (uint24[] memory batchColors) {
        if (startIndex >= TOTAL_PIXELS) {
            return new uint24[](0);
        }
        uint256 actualCount = count;
        if (startIndex + actualCount > TOTAL_PIXELS) {
            actualCount = TOTAL_PIXELS - startIndex;
        }

        batchColors = new uint24[](actualCount);
        for (uint256 i = 0; i < actualCount; i++) {
            batchColors[i] = pixels[startIndex + i];
        }
    }
}
